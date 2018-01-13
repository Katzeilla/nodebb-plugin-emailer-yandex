var winston = require.main.require('winston'),
	Meta = require.main.require('./src/meta'),
	Settings = require.main.require('./src/settings'),

	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),

	Emailer = {};


Emailer.init = function (data, callback) {
	function renderAdminPage(req, res, next) {
		res.render('admin/emailers/yandex', {});
	}

	data.router.get('/admin/emailers/yandex', data.middleware.admin.buildHeader, renderAdminPage);
	data.router.get('/api/admin/emailers/yandex', renderAdminPage);

	callback();
};

Emailer.send = function (data, callback) {
	var settings = new Settings('emailer-yandex', require('./package.json').version, {}, function () {
		var wrapper = settings.getWrapper(),
			username = wrapper.username,
			pass = wrapper.password;

		if (!username || !pass) {
			winston.error('[Yandex Emailer] Username and Password are required but not specified!');
		}

		if ('no-reply@localhost.lan' === data.from) {
			winston.error('[Yandex Emailer] "NodeBB ACP > Settings > Email" is required but not specified!');
		}

		var transportOptions = {
			debug: true,
			host: 'smtp.yandex.com',
			port: 25,
			secure: true,
			tls: {
				rejectUnauthorized: false
			},
			auth: {
				user: username,
				pass: pass
			}
		};

		var mailOptions = {
			from: data.from,
			to: data.to,
			html: data.html,
			text: data.plaintext,
			subject: data.subject
		};

		var transport = nodemailer.createTransport(smtpTransport(transportOptions));

		transport.sendMail(mailOptions, function (err, res) {
			if (err) {
				winston.error('[Yandex Emailer] Unable to send `' + data.template + '` email to uid ' + data.uid + '!!' + ' The error: ' + err);
			} else {
				winston.info('[Yandex Emailer] Sent `' + data.template + '` email to uid ' + data.uid);
			}
			callback(err, data);
		});

	});
}

Emailer.admin = {
	menu: function (custom_header, callback) {
		custom_header.plugins.push({
			"route": '/emailers/yandex',
			"icon": 'fa-envelope-o',
			"name": 'Yandex Emailer'
		});

		callback(null, custom_header);
	}
};

module.exports = Emailer;
