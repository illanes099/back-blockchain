import { pool } from "../database/database.js";
import { blockchainService } from "../blockchain/services/blockchain.service.js";
import { generarHashBoletin } from "../blockchain/utils/hash.util.js";

// POST: Certificar un boletín en Blockchain y Registrar en Base de Datos Local
export const certificarBoletin = async (req, res) => {
  try {
    const { estudianteId, paralelo, materias } = req.body;

    if (!estudianteId || !materias) {
      return res.status(400).json({ message: "Datos del boletín incompletos." });
    }

    // 1. Generar Hash Criptográfico único basado en las notas actuales
    const hash = generarHashBoletin(estudianteId, paralelo, materias);

    // 2. Transacción en la red Blockchain Sepolia mediante el servicio Web3
    const resultado = await blockchainService.registrarEnBlockchain(hash, estudianteId);

    // 3. Determinar el hash de transacción seguro para la Base de Datos
    let txHashSeguro = resultado.txHash;

    if (!txHashSeguro) {
      const checkExistente = await pool.query(
        "SELECT tx_hash FROM certificaciones_blockchain WHERE hash_boletin = $1",
        [hash]
      );

      if (checkExistente.rows.length > 0 && checkExistente.rows[0].tx_hash) {
        txHashSeguro = checkExistente.rows[0].tx_hash;
      } else {
        txHashSeguro = `REGISTERED_ON_CHAIN_${hash.substring(0, 18)}`;
      }
    }

    const fechaBolivia = new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" });
    const fechaLocal = new Date(fechaBolivia);

    // 4. Registrar la nueva certificación en PostgreSQL asociada al estudiante
    const queryInsert = `
      INSERT INTO certificaciones_blockchain (estudiante_id, hash_boletin, tx_hash ,fecha_registro)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (hash_boletin) DO UPDATE 
      SET tx_hash = COALESCE(EXCLUDED.tx_hash, certificaciones_blockchain.tx_hash),
          fecha_registro = EXCLUDED.fecha_registro
      RETURNING *;
    `;
    
    const dbResult = await pool.query(queryInsert, [estudianteId, hash, txHashSeguro, fechaLocal]);

    // 5. Responder exitosamente al cliente (HTTP 200)
    return res.status(200).json({
      success: true,
      message: resultado.yaExistia
        ? "El boletín ya se encontraba verificado en la red Blockchain."
        : "Boletín certificado en Blockchain con las nuevas notas.",
      hash,
      txHash: txHashSeguro,
      blockNumber: resultado.blockNumber || null,
      yaExistia: !!resultado.yaExistia,
      registroLocal: dbResult.rows[0],
    });
  } catch (error) {
    console.error("Error en certificarBoletin:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el boletín." 
    });
  }
};

// GET: Verificación pública (Consultado cuando escanean el QR desde el celular)
export const verificarHashPublico = async (req, res) => {
  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ message: "Hash o ID no proporcionado" });
    }

    const hashLimpio = hash.trim();

    // 1. Buscamos primero si el Hash exacto proporcionado existe en la BD local
    const queryExacto = `
      SELECT 
        cb.hash_boletin, 
        cb.tx_hash, 
        cb.fecha_registro,
        e.estudiante_id,
        u.nombre, 
        u.apellido, 
        e.foto,
        COALESCE(p.descripcion, 'General') AS paralelo
      FROM certificaciones_blockchain cb
      LEFT JOIN estudiantes e ON cb.estudiante_id = e.estudiante_id
      LEFT JOIN usuarios u ON e.usuario_id = u.usuario_id
      LEFT JOIN paralelo p ON e.paralelo_id = p.paralelo_id
      WHERE cb.hash_boletin = $1
    `;

    const dbResult = await pool.query(queryExacto, [hashLimpio]);

    if (dbResult.rows.length > 0) {
      const registro = dbResult.rows[0];

      // Verificamos si este hash es el MÁS RECIENTE para este estudiante en la base de datos.
      // Si existe un hash posterior para el mismo estudiante, significa que las notas fueron alteradas/actualizadas después.
      const queryUltimoHash = `
        SELECT hash_boletin FROM certificaciones_blockchain 
        WHERE estudiante_id = $1 
        ORDER BY fecha_registro DESC LIMIT 1
      `;
      const ultimoHashRes = await pool.query(queryUltimoHash, [registro.estudiante_id]);
      const hashMasReciente = ultimoHashRes.rows[0]?.hash_boletin;

      // Si el hash escaneado NO es el más reciente, significa que el boletín es obsoleto o fue modificado
      if (hashMasReciente && hashMasReciente !== hashLimpio) {
        return res.status(200).json({
          existe: true,
          autentico: false, // ❌ Ya no es auténtico porque hay una versión posterior modificada
          estatus: "ALERTA: Este boletín ha sido actualizado/modificado con nuevas notas con posterioridad. Documento obsoleto.",
          hash: hashLimpio,
          hashActualOficial: hashMasReciente,
        });
      }

      const nombreCompleto = `${registro.nombre || ""} ${registro.apellido || ""}`.trim();

      return res.status(200).json({
        existe: true,
        autentico: true,
        estatus: "Documento Oficial Verificado en Blockchain",
        hash: registro.hash_boletin,
        estudiante: nombreCompleto || "Estudiante Certificado",
        estudiante_id: registro.estudiante_id,
        estudianteId: registro.estudiante_id,
        paralelo: registro.paralelo,
        foto: registro.foto,
        fecha: Math.floor(new Date(registro.fecha_registro).getTime() / 1000),
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
        txHash: registro.tx_hash,
      });
    }

    // 2. Respaldo: Consulta en el Smart Contract de Sepolia si no está exacto en local
    const verificacion = await blockchainService.verificarEnBlockchain(hashLimpio);

    if (verificacion.esValido) {
      return res.status(200).json({
        existe: true,
        autentico: true,
        estatus: "Documento Oficial Verificado en Blockchain",
        hash: hashLimpio,
        estudiante: `Estudiante #${verificacion.estudianteId}`,
        estudiante_id: verificacion.estudianteId,
        estudianteId: verificacion.estudianteId,
        paralelo: "Registrado en Red",
        foto: null,
        fecha: Math.floor(new Date(verificacion.fechaRegistro).getTime() / 1000),
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
      });
    } else {
      return res.status(404).json({
        existe: false,
        autentico: false,
        estatus: "ALERTA: El boletín no figura en la red o fue alterado/plagiado.",
      });
    }
  } catch (error) {
    console.error("Error en verificarHashPublico:", error);
    return res.status(500).json({ message: error.message });
  }
};