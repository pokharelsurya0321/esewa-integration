const router = express.Router();

// Define your eSewa API credentials
const merchantId = 'EPAYTEST';
const secretKey = 'your_secret_key';
const baseUrl = 'https://uat.esewa.com.np';

// Route for initiating the payment process
router.post('/payment/initiate', async (req, res) => {
  try {
    // Prepare the request payload
    const payload = {
      amt: req.body.amount,
      psc: 'your_product_code',
      pdc: 'your_product_description',
      txAmt: '0',
      tAmt: req.body.amount,
      pid: req.body.paymentId,
      su: 'http://yourwebsite.com/success', // Success URL
      fu: 'http://yourwebsite.com/failure', // Failure URL
    };

    // Generate the checkSum using your secretKey
    const checkSum = `${merchantId}|${payload.pid}|${payload.amt}|${payload.psc}|${payload.pdc}|${payload.txAmt}|${payload.su}|${payload.fu}|${secretKey}`;
    payload.scd = checkSum;

    // Make a POST request to eSewa's initiate payment endpoint
    const response = await axios.post(`${baseUrl}/epay/main`, payload);

    // Redirect the user to the eSewa payment page
    res.redirect(response.data.url);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Route for handling the payment response callback
router.post('/payment/callback', (req, res) => {
  try {
    // Verify the received callback from eSewa
    const { oid, amt, refId, pid, sAmt, scd } = req.body;
    const checkSum = `${oid}|${pid}|${amt}|${sAmt}|${merchantId}|${secretKey}`;
    const expectedCheckSum = require('crypto')
      .createHash('md5')
      .update(checkSum)
      .digest('hex');

    // Compare the checksums to ensure data integrity
    if (scd !== expectedCheckSum) {
      throw new Error('Checksum verification failed');
    }

    // Handle the payment response and update your system accordingly
    if (req.body.responseCode === 'Success') {
      
    } else {
      // Payment failed, handle accordingly
    }

    res.sendStatus(200);
  } catch (error) {
    console.log('Error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
