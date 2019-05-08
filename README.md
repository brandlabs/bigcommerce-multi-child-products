# BigCommerce Multi-Child Products

Provides a way to change default required options layout on product page into a table of all available combined options.

## Getting Started

First, add the package (for example using npm) with `npm install bigcommerce-multi-child-products`.

Then, on your (custom) product template create or use a `<div>` element (we use the CSS class `js-multichild` but can be anyone you want) which is going to be used as the container for the Vuejs component.

On the product template you can also hide (or remove) the Add to Cart button since the component adds its own in order to add to cart more than one product at a time.

TODO: Continue here

### Prerequisites

Nodejs v10+ (we assume you have installed something like nvm for changing Node versions).

Have a valid `.stencil` file as documented [here](https://developer.bigcommerce.com/stencil-docs/getting-started/running-stencil-locally/authorizing-and-initializing).

## Example

TODO

## Notes

When clicking the Add to Cart button, customer is redirected to the Cart page since there is no easy way to show the added products on the cart preview popup.

## Authors
* Carson Reinke
* Hector Fernando Hurtado

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[![alt text](/assets/brandlabs.png)](http://www.brandlabs.us/?utm_source=gitlab&utm_medium=technology_referral&utm_campaign=brandlabs-bigcommerce-sitewide-banners)
