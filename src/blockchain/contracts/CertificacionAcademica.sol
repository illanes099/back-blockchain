// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificacionAcademica
 * @dev Registro inmutable de boletines de calificaciones para ESFM Warista
 */
contract CertificacionAcademica {
    address public admin;

    struct Certificado {
        string hashBoletin;      // SHA-256 de las calificaciones
        uint256 estudianteId;     // ID del estudiante en la BD
        uint256 fechaRegistro;   // Timestamp
        bool estaActivo;         // Estado de validez
    }

    // Mapeo: Hash del boletín => Datos del Certificado
    mapping(string => Certificado) private certificados;

    // Eventos para auditoría
    event BoletinRegistrado(string indexed hashBoletin, uint256 indexed estudianteId, uint256 timestamp);
    event BoletinRevocado(string indexed hashBoletin, uint256 timestamp);

    modifier soloAdmin() {
        require(msg.sender == admin, "Acceso denegado: Solo la Administracion/Direccion");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Registrar o Certificar un Boletín en Blockchain
    function registrarBoletin(string memory _hashBoletin, uint256 _estudianteId) public soloAdmin {
        require(bytes(certificados[_hashBoletin].hashBoletin).length == 0, "El boletin ya esta registrado");

        certificados[_hashBoletin] = Certificado({
            hashBoletin: _hashBoletin,
            estudianteId: _estudianteId,
            fechaRegistro: block.timestamp,
            estaActivo: true
        });

        emit BoletinRegistrado(_hashBoletin, _estudianteId, block.timestamp);
    }

    // Verificar si un Boletín es Auténtico
    function verificarBoletin(string memory _hashBoletin) public view returns (bool esValido, uint256 estudianteId, uint256 fechaRegistro) {
        Certificado memory cert = certificados[_hashBoletin];
        if (bytes(cert.hashBoletin).length > 0 && cert.estaActivo) {
            return (true, cert.estudianteId, cert.fechaRegistro);
        }
        return (false, 0, 0);
    }

    // Revocar Certificado (En caso de corrección administrativa)
    function revocarBoletin(string memory _hashBoletin) public soloAdmin {
        require(bytes(certificados[_hashBoletin].hashBoletin).length > 0, "El boletin no existe");
        certificados[_hashBoletin].estaActivo = false;
        emit BoletinRevocado(_hashBoletin, block.timestamp);
    }
}