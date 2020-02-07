var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// web3 added

const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
web3.eth.defaultAccount = web3.eth.accounts[0];

//
// a ganache account - 1st one, index 0
var account = '0xE4C8018A2cf7Ac91Cb407F19ea98FFE1ab1537F1';

// private key without 0x
var privateKey = Buffer.from(
	'f739ec453e6da90ed71d7281e2f382ace49f97e60ace74482606091f58e05c38',
	'hex'
);

var TestContract = new web3.eth.Contract(
	[
		{
			constant: false,
			inputs: [
				{
					name: '_greeting',
					type: 'string'
				}
			],
			name: 'setGreeting',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'getGreeting',
			outputs: [
				{
					name: '',
					type: 'string'
				}
			],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'constructor'
		}
	],
	// deployed contract address
	'0x223CdD9E007b3ea4386055a663C180Ee9e9cF4E6'
);

var data = TestContract.methods.setGreeting('HELLO WORLD!').encodeABI();
var rawTx = {
	nonce: '0x07',
	gasPrice: '0x09184e72a000',
	gasLimit: '0x67100',
	to: '0x0000000000000000000000000000000000000000',
	value: '0x00',
	data: data
};
var tx = new Tx(rawTx);
tx.sign(privateKey);

var serializedTx = tx.serialize();

web3.eth
	.sendSignedTransaction('0x' + serializedTx.toString('hex'))
	.on('receipt', console.log);

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
