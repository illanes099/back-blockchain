import { ethers } from "ethers";

// Usar RPCs rápidos/dedicados (Alchemy, Infura o Ankr son hasta 5x más rápidos que la RPC pública de Sepolia)
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "https://rpc.sepolia.org";
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function registrarBoletin(string memory _hashBoletin, uint256 _estudianteId) public",
  "function verificarBoletin(string memory _hashBoletin) public view returns (bool esValido, uint256 estudianteId, uint256 fechaRegistro)",
  "function revocarBoletin(string memory _hashBoletin) public",
];

class BlockchainService {
  constructor() {
    if (PRIVATE_KEY && CONTRACT_ADDRESS) {
      // Usamos el provider estático optimizado con staticNetwork para evitar llamadas de autoconsulta de red
      this.provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
        staticNetwork: true,
      });
      this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    } else {
      console.warn("⚠️ BlockchainService: Faltan llaves en variables de entorno. Modo Simulación activo.");
    }
  }

  /**
   * Registrar Hash en Blockchain con modo ultrarrápido (Respuesta Inmediata)
   * @param {string} hashBoletin 
   * @param {number|string} estudianteId 
   * @param {boolean} awaitConfirmation 
   */
  async registrarEnBlockchain(hashBoletin, estudianteId, awaitConfirmation = false) {
    try {
      if (!this.contract) {
        return { 
          success: true, 
          yaExistia: false,
          txHash: "0x_simulated_tx_" + Date.now() 
        };
      }

      // Estimación manual
      const feeData = await this.provider.getFeeData();

      // 1. Envío de la transacción a la mempool (Tarda < 1 segundo)
      const tx = await this.contract.registrarBoletin(hashBoletin, estudianteId, {
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
      });

      // 2. Si awaitConfirmation es false, retornamos de inmediato el tx.hash para actualizar la DB local
      if (!awaitConfirmation) {
        // La confirmación corre en segundo plano en la EVM
        tx.wait(1).then((receipt) => {
          console.log(` Transacción minada con éxito en bloque #${receipt.blockNumber} (TX: ${receipt.hash})`);
        }).catch((err) => {
          console.error(` Error en el minado en segundo plano (TX: ${tx.hash}):`, err.message);
        });

        return {
          success: true,
          yaExistia: false,
          txHash: tx.hash,
          estado: "pendiente_minado",
        };
      }

      // Si explícitamente se solicita esperar la confirmación
      const receipt = await tx.wait(1);

      return {
        success: true,
        yaExistia: false,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        estado: "confirmado",
      };

    } catch (error) {
      const mensajeError = error.reason || error.message || "";
      const errorString = JSON.stringify(error);

      if (
        mensajeError.includes("El boletin ya esta registrado") ||
        errorString.includes("El boletin ya esta registrado") ||
        error.code === "CALL_EXCEPTION"
      ) {
        return {
          success: true,
          yaExistia: true,
          hash: hashBoletin,
          txHash: error.transactionHash || null,
          message: "El boletín ya se encuentra certificado en la red Blockchain."
        };
      }

      console.error("Error crítico al registrar en Blockchain:", error);
      throw new Error(`Fallo de registro Web3: ${error.message}`);
    }
  }

  /**
   * Verificar la validez de un boletín en Blockchain
   */
  async verificarEnBlockchain(hashBoletin) {
    try {
      if (!this.contract) {
        return { esValido: true, estudianteId: 1, fechaRegistro: new Date() };
      }

      // Consulta de solo lectura RPC (view function)
      const [esValido, estudianteId, fechaRegistro] = await this.contract.verificarBoletin(hashBoletin);

      return {
        esValido,
        estudianteId: Number(estudianteId),
        fechaRegistro: new Date(Number(fechaRegistro) * 1000),
      };
    } catch (error) {
      console.error("Error al verificar en Blockchain:", error);
      return { esValido: false, error: error.message };
    }
  }
}

export const blockchainService = new BlockchainService();