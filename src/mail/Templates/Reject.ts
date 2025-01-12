export const Reject = (name: string, remarks: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alumni Membership Rejected</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          font-family: 'Arial', sans-serif;
          color: #333333;
        }

        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background-color: #ff4b4b;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }

        .header img {
          display: block;
          margin: 0 auto 10px;
          max-height: 100px;
        }

        .header h1 {
          font-size: 24px;
          margin: 0;
        }

        .content {
          padding: 20px;
          line-height: 1.6;
          font-size: 16px;
        }

        .content p {
          margin: 10px 0;
        }

        .content .remarks {
          background-color: #ffecec;
          border-left: 4px solid #ff4b4b;
          padding: 10px;
          margin: 15px 0;
          font-style: italic;
          color: #444;
        }

        .footer {
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #777;
          background-color: #f9f9f9;
          border-top: 1px solid #dddddd;
        }

        @media screen and (max-width: 480px) {
          .content {
            font-size: 14px;
            padding: 15px;
          }

          .header h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img
            src="http://gpnilokheri.ac.in/assets/img/Logo.jpeg"
            alt="College Logo"
          />
          <h1>Membership Rejection Notice</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>
            We regret to inform you that your alumni membership application has
            been <strong>rejected</strong>.
          </p>
          <p>
            As part of this decision, your account and any related posts have
            been permanently removed from our system.
          </p>
          <div class="remarks">
            <strong>Remarks:</strong> ${remarks}
          </div>
          <p>
            We deeply appreciate your interest in our alumni community and wish
            you great success in all your future endeavors.
          </p>
          <p>Thank you, Mr. ${name}</p>
          <p>Warm regards,</p>
          <p>The Alumni Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GPNilokheri Alumni Network. All
          rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};

export default Reject;
