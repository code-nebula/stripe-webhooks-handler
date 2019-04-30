const express = require('express')
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const stripe = require('stripe')('sk_test_5wRrRkW71NRhb4cIHdRL9Z32');
const app = express();

app.get('/', (req, res) => {
	res.send('Hello World!')
});

app.listen(8000, () => {
	console.log('Example app listening on port 8000!')
});

// have res.render work with html files
app.set('view engine', 'html');
// when res.render works with html files, have it use nunjucks to do so

app.use(express.static(__dirname))
app.use(bodyParser());

app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

const router = express.Router();

app.use('/', router)

router.get('/stripe-form', function (req, res, next) {
	res.render('stripeForm', { title: 'Stripe Form Title' });
})

router.post('/stripe-information', function (req, res, next) {
	console.log('Stripe token received: ', req.body)
	res.send("Stripe token received")
})

router.post('/stripe-information', function (req, res, next) {
	console.log('stripe information received: ', req.body)
	stripe.customers.create({
		description: 'My new customer',
		source: req.body.stripeToken,
	}, function (err, customer) {
		console.log('err: ', err, '|customer: ', customer)
		if (err) {
			res.json(err)
			return
		}
		res.json(customer)
		return
	})
})