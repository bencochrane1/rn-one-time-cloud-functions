const admin = require('firebase-admin');
const twilio = require('./twilio');

module.exports = function(req, res) {
	if (!req.body.phone) {
		return res.status(422).send({ error: 'Please add a phone number first' });
	}

	const phone = String(req.body.phone).replace(/[^\d]/g, "");

	admin.auth().getUser(phone)
	.then(userRecord => {
		const code = Math.floor((Math.random() * 8999 + 1000));

		twilio.messages.create({
			body: 'Your code is ' + code,
			to: phone,
			from: '+61280743658'
		}, (err) => {
			if (err) { return res.status(500).send(err) }

			admin.database().ref('users/' + phone)
			.update({ code: code, codeValid: true }, () => {
				res.send({ success: true });
			});
		})

	})
	.catch((err) => {
		res.status(422).send(err);
	});
}
