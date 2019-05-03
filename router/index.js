const express = require('express')
const nodemailer = require('nodemailer')
const stripe = require('stripe')('YOUR_SECRET_API_KEY_HERE')

const router = express.Router();

router.post("/webhooks", async function (req, res) {
    console.log("/webhooks POST route hit! req.body: ", req.body)

    let { data, type } = req.body
    let { previous_attributes, object } = data

    try {
        if ('status' in previous_attributes
            && type === 'customer.subscription.updated'
            && previous_attributes.status === 'active'
            && object.status === 'past_due') {
            console.log("subscription payment has failed! Subscription id: ", object.id)

            let customer_id = object.customer
            let product_id = object.plan.product
            // https://stripe.com/docs/api/subscriptions/object

            let customer_object = await stripe.customers.retrieve(
                customer_id,
                { expand: ["default_source"] }
            )

            let product_object = await stripe.products.retrieve(
                product_id
            )

            let customer_email = customer_object.email
            // https://stripe.com/docs/api/customers/object
            let product_name = product_object.name
            // https://stripe.com/docs/api/service_products/object
            let plan_name = object.plan.nickname
            // https://stripe.com/docs/api/plans

            // Nodemailer configuration
            let emailer = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'YOUR_EMAIL@gmail.com', //Your gmail address goes here
                    pass: 'YOUR_EMAIL_PASSWORD' //Your email password goes here
                }
            });

            // Send an email to the customer with information on their product and plan
            emailer.sendMail(
                {
                    from: 'YOUR_EMAIL@gmail.com', //Your gmail address goes here
                    to: customer_email,
                    subject: 'Your subscription payment has failed!',
                    html:
                        `<p>An automatic payment for your subscription to ${product_name} - ${plan_name} has failed. `
                        + `Please log in and update your payment information to ensure your subscription remains valid.</p>`
                },
                function (err, info) {
                    if (err)
                        console.log("error sending email: ", err)
                    else
                        console.log("error information: ", info);
                });

            res.send(200)
        }
        else {
            res.send(200)
        }
    }
    catch (err) {
        console.log("webhook error: ", err)
        res.send(200)
    }
})

module.exports = router