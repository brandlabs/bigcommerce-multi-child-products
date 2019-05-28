import Vue from 'vue';
import multichild from './multichild.vue';

export default function ($scopeBuilder, context, vueContainerSelector = '.js-multichild') {
    const rows = [];
    const rowLimits = [];
    const rowObjects = [];
    const newOptions = [];

    // First, we create an Array [[rows]] to initialize some counters based on number of options provided
    // We also create qn Array [[rowLimits]] with the length of each option values so we can count up to that number for each option
    // Then, we create a new array with just what we need from the context data which is the option ID and the values IDs and labels and save this data into [[rowObjects]]
    context.options.forEach(option => {
        rows.push(0);
        rowLimits.push(option.values.length);

        const rowObject = [];

        option.values.forEach(optionValue => {
            rowObject.push({
                attribute: option.id,
                attributeValue: optionValue.id,
                attributeLabel: optionValue.label,
                invisible: false,
                instock: true,
            });
        });

        rowObjects.push(rowObject);
    });

    // We keep track of when to finish mapping the options into a list opt combined option values since we don't know how many these can be
    let isNewOptionsReady = false;

    // For each option, we keep track of the current mapping of option value to new row mapping (it kind of resembles a binary counter)
    function decrementRows(dLength) {
        const currenIndex = dLength - 1;
        rows[currenIndex] += 1;

        if ((rows[currenIndex] < rowLimits[currenIndex]) === false) {
            if (currenIndex === 0) {
                isNewOptionsReady = true;
            } else {
                rows[currenIndex] = 0;

                decrementRows(currenIndex);
            }
        }
    }

    // Since we don't know the number of rows generated (by combining all option values), we keep track of the [[newOptions]] array index
    let currentOptionIndex = 0;

    // Here, we start combining all the data extracted above into the rows we need to pass into the Vue component to render the table needed.
    while (isNewOptionsReady === false) {
        newOptions[currentOptionIndex] = {
            attributes: [],
            label: '',
        };

        /* eslint no-loop-func: 'off' */
        rows.forEach((r, rIndex) => {
            newOptions[currentOptionIndex].attributes.push(rowObjects[rIndex][r]);
            newOptions[currentOptionIndex].label += `${rowObjects[rIndex][r].attributeLabel} `;
        });

        decrementRows(rows.length);

        currentOptionIndex += 1;
    }

    const lang = {};
    for (const contextProperty in context) {
        if (contextProperty.startsWith('lang')) {
            lang[contextProperty] = context[contextProperty];
        }
    }

    // we instantiate our Vue element
    const builder = (new Vue({
        el: vueContainerSelector,
        render: h => h(multichild),
        scope: $scopeBuilder,
    })).$children[0];

    builder.options = newOptions;
    builder.product_id = context.product_id;
    builder.lang = lang;
    builder.addToCartMessage = lang.langAddToCart;
    builder.freeShipping = !!document.querySelector('.product-free-shipping');

    // For each option values combination we get its sku and price and update the rows accordingly for Vue to update
    newOptions.forEach((newOption, newOptionIndex) => {
        const req = new XMLHttpRequest;

        req.open('POST', `/remote/v1/product-attributes/${context.product_id}`);
        req.withCredentials = true;

        req.setRequestHeader('stencil-config', '{}');
        req.setRequestHeader('stencil-options', '');

        const formdata = new FormData;
        formdata.append('action', 'add');

        newOption.attributes.forEach(attribute => {
            formdata.append(`attribute[${attribute.attribute}]`, attribute.attributeValue);
        });

        formdata.append('product_id', context.product_id);
        formdata.append('qty[]', 1);

        req.addEventListener('load', event => {
            if (event.target.response) {
                const response = JSON.parse(event.target.response);

                let price = 'without_tax' in response.data.price ? response.data.price.without_tax.value : 0;
                price = 'with_tax' in response.data.price ? response.data.price.with_tax.value : price;

                const invisible = response.data.base; // If the option values combination doesn't exist, the [[base]] attribute is true
                const instock = ('instock' in response.data) ? response.data.instock : true;

                builder.$set(builder.options, newOptionIndex, Object.assign(builder.options[newOptionIndex], { sku: response.data.sku, price, invisible, instock }));
            }
        });

        req.send(formdata);
    });
}
