export const getEmailTemplate = (data: any) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Help Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
        .info {
            margin-bottom: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-left: 5px solid #007bff;
        }
        .info strong {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Help Request Details</h2>
        </div>
        <div class="content">
            <div class="info"><strong>Full Name:</strong> ${data.fullName}</div>
            <div class="info"><strong>Mobile:</strong> ${data.mobile}</div>
            <div class="info"><strong>Email:</strong> ${data.email}</div>
            <div class="info"><strong>Address:</strong> ${data.address}</div>
            <div class="info"><strong>Pincode:</strong> ${data.pincode}</div>
            <div class="info"><strong>State:</strong> ${data.state}</div>
            <div class="info"><strong>District:</strong> ${data.district}</div>
            <div class="info"><strong>Help Category:</strong> ${data.helpCategory}</div>
            <div class="info"><strong>Help Sub-Category:</strong> ${data.helpSubCategory}</div>
            <div class="info"><strong>Help Mode:</strong> ${data.helpMode}</div>
            <div class="info"><strong>Date:</strong> ${data.date.toDateString()}</div>
            <div class="info"><strong>Block:</strong> ${data.block}</div>
            <div class="info"><strong>Description:</strong> ${data.description}</div>
        </div>
        <div class="footer">
            <p>&copy; 2025 Your Organization. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;