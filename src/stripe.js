import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = 'pk_test_51Sg2IL7TmLmUB1fC5JLdPhgsNbOBV2N9uxZtthgDHMrTQHAbu2LtE5lhTEewUOYx2MQATgrvusRRCw07aBDbSOZ200QWMsa37j'

export const stripePromise = loadStripe(stripePublishableKey)
