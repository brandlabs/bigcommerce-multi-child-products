# BigCommerce Multi-Child Products

Provides a way to change default required options layout on product page into a table of all available combined options.

## Getting Started

TODO

### Prerequisites

Nodejs v10+ (we assume you have installed something like nvm for changing Node versions).

Have a valid `.stencil` file as documented [here](https://developer.bigcommerce.com/stencil-docs/getting-started/running-stencil-locally/authorizing-and-initializing).

### Installing

TODO

## Example

TODO

## Notes
- Since BigCommerce doesn't transpile external package code (for oldies like IE11), we provide transpiled files inside __dist/__ folder. You can access these files adding an alias on your `webpack.conf.js` (or `webpack.common.js`) file like `'bigcommerce-sitewide-banners': path.resolve(__dirname, 'node_modules/bigcommerce-sitewide-banners/dist/sitewide-banners.min.js')`

## Authors
* Carson Reinke
* Hector Fernando Hurtado

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[![alt text](/assets/brandlabs.png)](http://www.brandlabs.us/?utm_source=gitlab&utm_medium=technology_referral&utm_campaign=brandlabs-bigcommerce-sitewide-banners)
