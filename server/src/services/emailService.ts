import nodemailer from "nodemailer";

export const sendApprovalEmail = async (email: string, name: string) => {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"TeamFlow Admin" <admin@teamflow.com>', // sender address
      to: email, // list of receivers
      subject: "Your TeamFlow Account is Approved!", // Subject line
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Welcome to TeamFlow, ${name}!</h2>
          <p style="color: #333; font-size: 16px;">
            Great news! Your account has been reviewed and approved by an administrator.
          </p>
          <p style="color: #333; font-size: 16px;">
            You can now log in and start collaborating with your team.
          </p>
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Log In to TeamFlow
            </a>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
