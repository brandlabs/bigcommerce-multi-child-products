<template>
    <div class="productview-options">
        <div v-if="options.length > 0" class="form-block w-form">
            <div class="child-grid-container">
                <div class="child-grid-select-text">{{ lang.langSelectItems }}</div>
                <div class="child-grid-th">
                    <div class="child-grid-th-item-number">
                        <div>{{ lang.langProductCode }}</div>
                    </div>
                    <div class="child-grid-th-item-name">
                        <div>{{ lang.langItemName }}</div>
                    </div>
                    <div class="child-grid-th-price">
                        <div>{{ lang.langPrice }}</div>
                    </div>
                    <div class="child-grid-th-qty">
                        <div>{{ lang.langQty }}</div>
                    </div>
                    <div class="child-grid-th-add">
                        <div>{{ lang.langAdd }}</div>
                    </div>
                </div>

                <div class="child-grid-row" v-for="(option, optionIndex) in options">
                    <div v-show="option.invisible === false">
                        <div class="child-grid-row-item-number">
                            <div class="child-item-number-label">
                                <div>{{ lang.langProductCode }}</div>
                            </div>
                            <div class="child-item-number-container">
                                <div>{{ option.sku }}</div>
                            </div>
                        </div>
                        <div class="child-grid-row-item-name">
                            <div class="child-item-name-label">
                                <div>{{ lang.langItemName }}</div>
                            </div>
                            <div class="child-item-name-container">
                                <div>{{ option.label }}</div>
                            </div>
                        </div>
                        <div class="child-grid-row-price">
                            <div class="child-item-price-label">
                                <div>{{ lang.langPrice }}</div>
                            </div>
                            <div class="child-item-price-container">
                                <div>{{ option.price }}</div>
                            </div>
                        </div>
                        <div class="child-grid-row-qty">
                            <div class="child-item-qty-label">
                                <div>{{ lang.langQty }}</div>
                            </div>
                            <div class="child-item-qty-container">
                                <input 
                                    type="text" 
                                    class="child-grid-qty-field w-input" 
                                    maxlength="256" 
                                    placeholder="1" 
                                    value="1" 
                                    :data-optionid="optionIndex"
                                    @input="optionSelected()"
                                >
                            </div>
                        </div>
                        <div class="child-grid-row-add">
                            <div class="child-item-add-label">
                                <div>{{ lang.langAdd }}</div>
                            </div>
                            <div class="child-item-add-container">
                                <div class="child-add-checkbox-field w-checkbox" v-if="option.instock">                                    
                                    <input type="checkbox" class="child-add-checkbox-hide w-checkbox-input" @change="optionSelected()">
                                </div>
                                <div v-else class="child-add-checkbox-field w-checkbox">
                                    <p>{{ lang.langOutOfStock }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="child-grid-atc-button">
                <div class="product-free-shipping">
                    <img src="/content/icons/product-badge-free-shipping.svg" alt="Free Shipping!" class="product-free-shipping-badge">
                </div>
                <div class="child-grid-total-label">{{ lang.langTotal }}</div>
                <p class="product-price child-grid-total-price">
                    <span class="product-price-dollar">{{ lang.langCurrencyToken }}</span>{{ total ? total.toFixed(2) : 0 }}
                </p>
                <button v-if="total > 0" class="button button--primary form-addtocart-childgrid w-button" @click.stop="addToCart()" :disabled="addToCartDisabled" type="button">{{ addToCartMessage }}</button>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * We add to cart the selected row
 * @param {number} qty Number of items selected
 * @param {object} option Object containing all option values ids in order to send that data into BigCommerce
 * @param {number} product_id
 * @return {promise}
 */
function addToCartRequest(qty, option, product_id) {
    return new Promise(resolve => {
        const req = new XMLHttpRequest;

        req.open('POST', '/remote/v1/cart/add');
        req.withCredentials = true;

        req.setRequestHeader('stencil-config', '{}');
        req.setRequestHeader('stencil-options', '{}');

        const formdata = new FormData;
        formdata.append('action', 'add');
        formdata.append('child-add', 'on');

        option.attributes.forEach(attribute => {
            formdata.append(`attribute[${attribute.attribute}]`, attribute.attributeValue);
        });

        formdata.append('product_id', product_id);
        formdata.append('qty[]', qty);

        req.addEventListener('load', () => resolve());
        req.send(formdata);
    });
}

export default {
    name: 'bl-multichild',
    data () {
        return {
            options: [],
            total: 0,
            product_id: 0,
            partial: [],
            addToCartDisabled: false,
            lang: {},
            addToCartMessage: '',
        };
    },
    methods: {
        updateOptions(optionIndex, attributes) {
            Object.assign(this.options[optionIndex], attributes);
        },

        // When a row checkbox is checked we get all checked rows input values and add them up to update the Total value so far.
        optionSelected() {
            this.total = 0;

            this.$el.querySelectorAll('.w-checkbox-input')
                .forEach($input => {
                    if (!$input.checked) return;

                    const $parent = $input.closest('.child-grid-row');

                    const price = parseFloat($parent.querySelector('.child-item-price-container').textContent, 10);
                    const qty = parseInt($parent.querySelector('.child-grid-qty-field').value, 10);

                    this.total += price * qty;
                });
        },

        // We need to add to cart each combination of option values serialy because BigCommerce requires that, that's why we;re using a for...loop and then update the Add to cart button and redirect the customer into Cart page
        async addToCart() {
            this.addToCartMessage = this.langAddingToCart;
            this.addToCartDisabled = true;

            const $checkboxes = this.$el.querySelectorAll('.w-checkbox-input');
            for (let checkboxIndex = 0; checkboxIndex < $checkboxes.length; checkboxIndex += 1) {
                const $checkbox = $checkboxes[checkboxIndex];
                if (!$checkbox.checked) continue;

                const $parent = $checkbox.closest('.child-grid-row');
                const $inputField = $parent.querySelector('.child-grid-qty-field');

                const qty = parseInt($inputField.value, 10);
                const optionIndex = parseInt($inputField.getAttribute('data-optionid'), 10);

                $inputField.value = 1;
                $checkbox.checked = false;
                this.total = 0;

                await addToCartRequest(qty, this.options[optionIndex], this.product_id);
            }

            this.addToCartMessage = this.langAddToCart;
            location.href = '/cart.php';
        }
    }
}
</script>
