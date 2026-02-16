import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "🔐 Recupera tu acceso - Latin Territory",
      html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; text-align: center;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: left;">
          
          <tr>
            <td style="height: 6px; padding: 0; font-size: 0; line-height: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="height: 6px;">
                <tr>
                  <td width="50%" style="background-color: #fbbf24; height: 6px;"></td>
                  <td width="25%" style="background-color: #3b82f6; height: 6px;"></td>
                  <td width="25%" style="background-color: #ef4444; height: 6px;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="color: #171717; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Plataforma Colombiana</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 20px;">Hola,</p>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 30px;">Hemos recibido una solicitud de recuperación para tu cuenta. Si perdiste tu contraseña, no te preocupes, puedes establecer una nueva haciendo clic en el siguiente botón:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-family: sans-serif;">Actualizar mi contraseña</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 30px 0 0;">Este enlace es único y expirará en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0;">
                © ${new Date().getFullYear()} Latin Territory.<br>
                Diseñado y desarrollado por <strong>JaviWarrior Studio</strong>.
              </p>
            </td>
          </tr>
        </table>
        
        <div style="height: 40px;"></div>
      </body>
      </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo de recuperación enviado con éxito:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error al enviar el correo con Zoho:", error);
    throw new Error("No se pudo enviar el correo de recuperación.");
  }
};
