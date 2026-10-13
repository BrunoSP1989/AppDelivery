const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

exports.getPresignedUploadUrl = async (req, res) => {
  try {
    const { id: storeId } = req.user; // Obtido via JWT autenticado
    const { idProduto, fileType } = req.body;

    if (!idProduto || !fileType) {
      return res.status(400).json({ 
        message: 'idProduto e fileType (ex: image/jpeg) são obrigatórios.' 
      });
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(fileType)) {
      return res.status(400).json({ 
        message: 'Formato inválido. Envie imagens JPEG, PNG ou WEBP.' 
      });
    }

    // Prefixo isolado por loja: produtos/{storeId}/{idProduto}-{timestamp}.ext
    const extensao = fileType.split('/')[1];
    const key = `produtos/${storeId}/${idProduto}-${Date.now()}.${extensao}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Assinatura temporária válida por 10 minutos (600 segundos)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    // Link público definitivo para gravação no MongoDB
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error('Erro ao gerar presigned URL:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao gerar autorização de upload.',
      error: error.message 
    });
  }
};