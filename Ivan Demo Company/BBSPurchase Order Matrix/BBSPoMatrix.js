/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Sep 2017     cedricgriffiths
 *
 */
	
	
//=============================================================================================
//Constants
//=============================================================================================
//
const TOTAL = 999997;
const UNITCOST = 999998;
const TOTALCOST = 999999;
const NOPARENTID = 999996;
const COLOURID = 441;
const SIZEID = 442;
const LENGTHID = 76;
const EMAILINFO = 'andrew.cox@brightbridgesolutions.com';
const TELINFO = '+44 (0) 330 133 5000'

	
	
	
//=============================================================================================
//Start of main code
//=============================================================================================
//
function matrixOutputSuitelet(request, response)
{
	//=============================================================================================
	//Number formatting functions
	//=============================================================================================
	//
	/*! @preserve
	 * numeral.js
	 * version : 2.0.6
	 * author : Adam Draper
	 * license : MIT
	 * http://adamwdraper.github.com/Numeral-js/
	 */

	(function (global, factory) {
	    if (typeof define === 'function' && define.amd) {
	        define(factory);
	    } else if (typeof module === 'object' && module.exports) {
	        module.exports = factory();
	    } else {
	        global.numeral = factory();
	    }
	}(this, function () {
	    /************************************
	        Variables
	    ************************************/

	    var numeral,
	        _,
	        VERSION = '2.0.6',
	        formats = {},
	        locales = {},
	        defaults = {
	            currentLocale: 'en',
	            zeroFormat: null,
	            nullFormat: null,
	            defaultFormat: '0,0',
	            scalePercentBy100: true
	        },
	        options = {
	            currentLocale: defaults.currentLocale,
	            zeroFormat: defaults.zeroFormat,
	            nullFormat: defaults.nullFormat,
	            defaultFormat: defaults.defaultFormat,
	            scalePercentBy100: defaults.scalePercentBy100
	        };


	    /************************************
	        Constructors
	    ************************************/

	    // Numeral prototype object
	    function Numeral(input, number) {
	        this._input = input;

	        this._value = number;
	    }

	    numeral = function(input) {
	        var value,
	            kind,
	            unformatFunction,
	            regexp;

	        if (numeral.isNumeral(input)) {
	            value = input.value();
	        } else if (input === 0 || typeof input === 'undefined') {
	            value = 0;
	        } else if (input === null || _.isNaN(input)) {
	            value = null;
	        } else if (typeof input === 'string') {
	            if (options.zeroFormat && input === options.zeroFormat) {
	                value = 0;
	            } else if (options.nullFormat && input === options.nullFormat || !input.replace(/[^0-9]+/g, '').length) {
	                value = null;
	            } else {
	                for (kind in formats) {
	                    regexp = typeof formats[kind].regexps.unformat === 'function' ? formats[kind].regexps.unformat() : formats[kind].regexps.unformat;

	                    if (regexp && input.match(regexp)) {
	                        unformatFunction = formats[kind].unformat;

	                        break;
	                    }
	                }

	                unformatFunction = unformatFunction || numeral._.stringToNumber;

	                value = unformatFunction(input);
	            }
	        } else {
	            value = Number(input)|| null;
	        }

	        return new Numeral(input, value);
	    };

	    // version number
	    numeral.version = VERSION;

	    // compare numeral object
	    numeral.isNumeral = function(obj) {
	        return obj instanceof Numeral;
	    };

	    // helper functions
	    numeral._ = _ = {
	        // formats numbers separators, decimals places, signs, abbreviations
	        numberToFormat: function(value, format, roundingFunction) {
	            var locale = locales[numeral.options.currentLocale],
	                negP = false,
	                optDec = false,
	                leadingCount = 0,
	                abbr = '',
	                trillion = 1000000000000,
	                billion = 1000000000,
	                million = 1000000,
	                thousand = 1000,
	                decimal = '',
	                neg = false,
	                abbrForce, // force abbreviation
	                abs,
	                min,
	                max,
	                power,
	                int,
	                precision,
	                signed,
	                thousands,
	                output;

	            // make sure we never format a null value
	            value = value || 0;

	            abs = Math.abs(value);

	            // see if we should use parentheses for negative number or if we should prefix with a sign
	            // if both are present we default to parentheses
	            if (numeral._.includes(format, '(')) {
	                negP = true;
	                format = format.replace(/[\(|\)]/g, '');
	            } else if (numeral._.includes(format, '+') || numeral._.includes(format, '-')) {
	                signed = numeral._.includes(format, '+') ? format.indexOf('+') : value < 0 ? format.indexOf('-') : -1;
	                format = format.replace(/[\+|\-]/g, '');
	            }

	            // see if abbreviation is wanted
	            if (numeral._.includes(format, 'a')) {
	                abbrForce = format.match(/a(k|m|b|t)?/);

	                abbrForce = abbrForce ? abbrForce[1] : false;

	                // check for space before abbreviation
	                if (numeral._.includes(format, ' a')) {
	                    abbr = ' ';
	                }

	                format = format.replace(new RegExp(abbr + 'a[kmbt]?'), '');

	                if (abs >= trillion && !abbrForce || abbrForce === 't') {
	                    // trillion
	                    abbr += locale.abbreviations.trillion;
	                    value = value / trillion;
	                } else if (abs < trillion && abs >= billion && !abbrForce || abbrForce === 'b') {
	                    // billion
	                    abbr += locale.abbreviations.billion;
	                    value = value / billion;
	                } else if (abs < billion && abs >= million && !abbrForce || abbrForce === 'm') {
	                    // million
	                    abbr += locale.abbreviations.million;
	                    value = value / million;
	                } else if (abs < million && abs >= thousand && !abbrForce || abbrForce === 'k') {
	                    // thousand
	                    abbr += locale.abbreviations.thousand;
	                    value = value / thousand;
	                }
	            }

	            // check for optional decimals
	            if (numeral._.includes(format, '[.]')) {
	                optDec = true;
	                format = format.replace('[.]', '.');
	            }

	            // break number and format
	            int = value.toString().split('.')[0];
	            precision = format.split('.')[1];
	            thousands = format.indexOf(',');
	            leadingCount = (format.split('.')[0].split(',')[0].match(/0/g) || []).length;

	            if (precision) {
	                if (numeral._.includes(precision, '[')) {
	                    precision = precision.replace(']', '');
	                    precision = precision.split('[');
	                    decimal = numeral._.toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
	                } else {
	                    decimal = numeral._.toFixed(value, precision.length, roundingFunction);
	                }

	                int = decimal.split('.')[0];

	                if (numeral._.includes(decimal, '.')) {
	                    decimal = locale.delimiters.decimal + decimal.split('.')[1];
	                } else {
	                    decimal = '';
	                }

	                if (optDec && Number(decimal.slice(1)) === 0) {
	                    decimal = '';
	                }
	            } else {
	                int = numeral._.toFixed(value, 0, roundingFunction);
	            }

	            // check abbreviation again after rounding
	            if (abbr && !abbrForce && Number(int) >= 1000 && abbr !== locale.abbreviations.trillion) {
	                int = String(Number(int) / 1000);

	                switch (abbr) {
	                    case locale.abbreviations.thousand:
	                        abbr = locale.abbreviations.million;
	                        break;
	                    case locale.abbreviations.million:
	                        abbr = locale.abbreviations.billion;
	                        break;
	                    case locale.abbreviations.billion:
	                        abbr = locale.abbreviations.trillion;
	                        break;
	                }
	            }


	            // format number
	            if (numeral._.includes(int, '-')) {
	                int = int.slice(1);
	                neg = true;
	            }

	            if (int.length < leadingCount) {
	                for (var i = leadingCount - int.length; i > 0; i--) {
	                    int = '0' + int;
	                }
	            }

	            if (thousands > -1) {
	                int = int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + locale.delimiters.thousands);
	            }

	            if (format.indexOf('.') === 0) {
	                int = '';
	            }

	            output = int + decimal + (abbr ? abbr : '');

	            if (negP) {
	                output = (negP && neg ? '(' : '') + output + (negP && neg ? ')' : '');
	            } else {
	                if (signed >= 0) {
	                    output = signed === 0 ? (neg ? '-' : '+') + output : output + (neg ? '-' : '+');
	                } else if (neg) {
	                    output = '-' + output;
	                }
	            }

	            return output;
	        },
	        // unformats numbers separators, decimals places, signs, abbreviations
	        stringToNumber: function(string) {
	            var locale = locales[options.currentLocale],
	                stringOriginal = string,
	                abbreviations = {
	                    thousand: 3,
	                    million: 6,
	                    billion: 9,
	                    trillion: 12
	                },
	                abbreviation,
	                value,
	                i,
	                regexp;

	            if (options.zeroFormat && string === options.zeroFormat) {
	                value = 0;
	            } else if (options.nullFormat && string === options.nullFormat || !string.replace(/[^0-9]+/g, '').length) {
	                value = null;
	            } else {
	                value = 1;

	                if (locale.delimiters.decimal !== '.') {
	                    string = string.replace(/\./g, '').replace(locale.delimiters.decimal, '.');
	                }

	                for (abbreviation in abbreviations) {
	                    regexp = new RegExp('[^a-zA-Z]' + locale.abbreviations[abbreviation] + '(?:\\)|(\\' + locale.currency.symbol + ')?(?:\\))?)?$');

	                    if (stringOriginal.match(regexp)) {
	                        value *= Math.pow(10, abbreviations[abbreviation]);
	                        break;
	                    }
	                }

	                // check for negative number
	                value *= (string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2 ? 1 : -1;

	                // remove non numbers
	                string = string.replace(/[^0-9\.]+/g, '');

	                value *= Number(string);
	            }

	            return value;
	        },
	        isNaN: function(value) {
	            return typeof value === 'number' && isNaN(value);
	        },
	        includes: function(string, search) {
	            return string.indexOf(search) !== -1;
	        },
	        insert: function(string, subString, start) {
	            return string.slice(0, start) + subString + string.slice(start);
	        },
	        reduce: function(array, callback /*, initialValue*/) {
	            if (this === null) {
	                throw new TypeError('Array.prototype.reduce called on null or undefined');
	            }

	            if (typeof callback !== 'function') {
	                throw new TypeError(callback + ' is not a function');
	            }

	            var t = Object(array),
	                len = t.length >>> 0,
	                k = 0,
	                value;

	            if (arguments.length === 3) {
	                value = arguments[2];
	            } else {
	                while (k < len && !(k in t)) {
	                    k++;
	                }

	                if (k >= len) {
	                    throw new TypeError('Reduce of empty array with no initial value');
	                }

	                value = t[k++];
	            }
	            for (; k < len; k++) {
	                if (k in t) {
	                    value = callback(value, t[k], k, t);
	                }
	            }
	            return value;
	        },
	        /**
	         * Computes the multiplier necessary to make x >= 1,
	         * effectively eliminating miscalculations caused by
	         * finite precision.
	         */
	        multiplier: function (x) {
	            var parts = x.toString().split('.');

	            return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
	        },
	        /**
	         * Given a variable number of arguments, returns the maximum
	         * multiplier that must be used to normalize an operation involving
	         * all of them.
	         */
	        correctionFactor: function () {
	            var args = Array.prototype.slice.call(arguments);

	            return args.reduce(function(accum, next) {
	                var mn = _.multiplier(next);
	                return accum > mn ? accum : mn;
	            }, 1);
	        },
	        /**
	         * Implementation of toFixed() that treats floats more like decimals
	         *
	         * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
	         * problems for accounting- and finance-related software.
	         */
	        toFixed: function(value, maxDecimals, roundingFunction, optionals) {
	            var splitValue = value.toString().split('.'),
	                minDecimals = maxDecimals - (optionals || 0),
	                boundedPrecision,
	                optionalsRegExp,
	                power,
	                output;

	            // Use the smallest precision value possible to avoid errors from floating point representation
	            if (splitValue.length === 2) {
	              boundedPrecision = Math.min(Math.max(splitValue[1].length, minDecimals), maxDecimals);
	            } else {
	              boundedPrecision = minDecimals;
	            }

	            power = Math.pow(10, boundedPrecision);

	            // Multiply up by precision, round accurately, then divide and use native toFixed():
	            output = (roundingFunction(value + 'e+' + boundedPrecision) / power).toFixed(boundedPrecision);

	            if (optionals > maxDecimals - boundedPrecision) {
	                optionalsRegExp = new RegExp('\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$');
	                output = output.replace(optionalsRegExp, '');
	            }

	            return output;
	        }
	    };

	    // avaliable options
	    numeral.options = options;

	    // avaliable formats
	    numeral.formats = formats;

	    // avaliable formats
	    numeral.locales = locales;

	    // This function sets the current locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    numeral.locale = function(key) {
	        if (key) {
	            options.currentLocale = key.toLowerCase();
	        }

	        return options.currentLocale;
	    };

	    // This function provides access to the loaded locale data.  If
	    // no arguments are passed in, it will simply return the current
	    // global locale object.
	    numeral.localeData = function(key) {
	        if (!key) {
	            return locales[options.currentLocale];
	        }

	        key = key.toLowerCase();

	        if (!locales[key]) {
	            throw new Error('Unknown locale : ' + key);
	        }

	        return locales[key];
	    };

	    numeral.reset = function() {
	        for (var property in defaults) {
	            options[property] = defaults[property];
	        }
	    };

	    numeral.zeroFormat = function(format) {
	        options.zeroFormat = typeof(format) === 'string' ? format : null;
	    };

	    numeral.nullFormat = function (format) {
	        options.nullFormat = typeof(format) === 'string' ? format : null;
	    };

	    numeral.defaultFormat = function(format) {
	        options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
	    };

	    numeral.register = function(type, name, format) {
	        name = name.toLowerCase();

	        if (this[type + 's'][name]) {
	            throw new TypeError(name + ' ' + type + ' already registered.');
	        }

	        this[type + 's'][name] = format;

	        return format;
	    };


	    numeral.validate = function(val, culture) {
	        var _decimalSep,
	            _thousandSep,
	            _currSymbol,
	            _valArray,
	            _abbrObj,
	            _thousandRegEx,
	            localeData,
	            temp;

	        //coerce val to string
	        if (typeof val !== 'string') {
	            val += '';

	            if (console.warn) {
	                console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
	            }
	        }

	        //trim whitespaces from either sides
	        val = val.trim();

	        //if val is just digits return true
	        if (!!val.match(/^\d+$/)) {
	            return true;
	        }

	        //if val is empty return false
	        if (val === '') {
	            return false;
	        }

	        //get the decimal and thousands separator from numeral.localeData
	        try {
	            //check if the culture is understood by numeral. if not, default it to current locale
	            localeData = numeral.localeData(culture);
	        } catch (e) {
	            localeData = numeral.localeData(numeral.locale());
	        }

	        //setup the delimiters and currency symbol based on culture/locale
	        _currSymbol = localeData.currency.symbol;
	        _abbrObj = localeData.abbreviations;
	        _decimalSep = localeData.delimiters.decimal;
	        if (localeData.delimiters.thousands === '.') {
	            _thousandSep = '\\.';
	        } else {
	            _thousandSep = localeData.delimiters.thousands;
	        }

	        // validating currency symbol
	        temp = val.match(/^[^\d]+/);
	        if (temp !== null) {
	            val = val.substr(1);
	            if (temp[0] !== _currSymbol) {
	                return false;
	            }
	        }

	        //validating abbreviation symbol
	        temp = val.match(/[^\d]+$/);
	        if (temp !== null) {
	            val = val.slice(0, -1);
	            if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
	                return false;
	            }
	        }

	        _thousandRegEx = new RegExp(_thousandSep + '{2}');

	        if (!val.match(/[^\d.,]/g)) {
	            _valArray = val.split(_decimalSep);
	            if (_valArray.length > 2) {
	                return false;
	            } else {
	                if (_valArray.length < 2) {
	                    return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
	                } else {
	                    if (_valArray[0].length === 1) {
	                        return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
	                    } else {
	                        return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
	                    }
	                }
	            }
	        }

	        return false;
	    };


	    /************************************
	        Numeral Prototype
	    ************************************/

	    numeral.fn = Numeral.prototype = {
	        clone: function() {
	            return numeral(this);
	        },
	        format: function(inputString, roundingFunction) {
	            var value = this._value,
	                format = inputString || options.defaultFormat,
	                kind,
	                output,
	                formatFunction;

	            // make sure we have a roundingFunction
	            roundingFunction = roundingFunction || Math.round;

	            // format based on value
	            if (value === 0 && options.zeroFormat !== null) {
	                output = options.zeroFormat;
	            } else if (value === null && options.nullFormat !== null) {
	                output = options.nullFormat;
	            } else {
	                for (kind in formats) {
	                    if (format.match(formats[kind].regexps.format)) {
	                        formatFunction = formats[kind].format;

	                        break;
	                    }
	                }

	                formatFunction = formatFunction || numeral._.numberToFormat;

	                output = formatFunction(value, format, roundingFunction);
	            }

	            return output;
	        },
	        value: function() {
	            return this._value;
	        },
	        input: function() {
	            return this._input;
	        },
	        set: function(value) {
	            this._value = Number(value);

	            return this;
	        },
	        add: function(value) {
	            var corrFactor = _.correctionFactor.call(null, this._value, value);

	            function cback(accum, curr, currI, O) {
	                return accum + Math.round(corrFactor * curr);
	            }

	            this._value = _.reduce([this._value, value], cback, 0) / corrFactor;

	            return this;
	        },
	        subtract: function(value) {
	            var corrFactor = _.correctionFactor.call(null, this._value, value);

	            function cback(accum, curr, currI, O) {
	                return accum - Math.round(corrFactor * curr);
	            }

	            this._value = _.reduce([value], cback, Math.round(this._value * corrFactor)) / corrFactor;

	            return this;
	        },
	        multiply: function(value) {
	            function cback(accum, curr, currI, O) {
	                var corrFactor = _.correctionFactor(accum, curr);
	                return Math.round(accum * corrFactor) * Math.round(curr * corrFactor) / Math.round(corrFactor * corrFactor);
	            }

	            this._value = _.reduce([this._value, value], cback, 1);

	            return this;
	        },
	        divide: function(value) {
	            function cback(accum, curr, currI, O) {
	                var corrFactor = _.correctionFactor(accum, curr);
	                return Math.round(accum * corrFactor) / Math.round(curr * corrFactor);
	            }

	            this._value = _.reduce([this._value, value], cback);

	            return this;
	        },
	        difference: function(value) {
	            return Math.abs(numeral(this._value).subtract(value).value());
	        }
	    };

	    /************************************
	        Default Locale && Format
	    ************************************/

	    numeral.register('locale', 'en', {
	        delimiters: {
	            thousands: ',',
	            decimal: '.'
	        },
	        abbreviations: {
	            thousand: 'k',
	            million: 'm',
	            billion: 'b',
	            trillion: 't'
	        },
	        ordinal: function(number) {
	            var b = number % 10;
	            return (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	        },
	        currency: {
	            symbol: '$'
	        }
	    });

	    

	(function() {
	        numeral.register('format', 'bps', {
	            regexps: {
	                format: /(BPS)/,
	                unformat: /(BPS)/
	            },
	            format: function(value, format, roundingFunction) {
	                var space = numeral._.includes(format, ' BPS') ? ' ' : '',
	                    output;

	                value = value * 10000;

	                // check for space before BPS
	                format = format.replace(/\s?BPS/, '');

	                output = numeral._.numberToFormat(value, format, roundingFunction);

	                if (numeral._.includes(output, ')')) {
	                    output = output.split('');

	                    output.splice(-1, 0, space + 'BPS');

	                    output = output.join('');
	                } else {
	                    output = output + space + 'BPS';
	                }

	                return output;
	            },
	            unformat: function(string) {
	                return +(numeral._.stringToNumber(string) * 0.0001).toFixed(15);
	            }
	        });
	})();


	(function() {
	        var decimal = {
	            base: 1000,
	            suffixes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	        },
	        binary = {
	            base: 1024,
	            suffixes: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
	        };

	    var allSuffixes =  decimal.suffixes.concat(binary.suffixes.filter(function (item) {
	            return decimal.suffixes.indexOf(item) < 0;
	        }));
	        var unformatRegex = allSuffixes.join('|');
	        // Allow support for BPS (http://www.investopedia.com/terms/b/basispoint.asp)
	        unformatRegex = '(' + unformatRegex.replace('B', 'B(?!PS)') + ')';

	    numeral.register('format', 'bytes', {
	        regexps: {
	            format: /([0\s]i?b)/,
	            unformat: new RegExp(unformatRegex)
	        },
	        format: function(value, format, roundingFunction) {
	            var output,
	                bytes = numeral._.includes(format, 'ib') ? binary : decimal,
	                suffix = numeral._.includes(format, ' b') || numeral._.includes(format, ' ib') ? ' ' : '',
	                power,
	                min,
	                max;

	            // check for space before
	            format = format.replace(/\s?i?b/, '');

	            for (power = 0; power <= bytes.suffixes.length; power++) {
	                min = Math.pow(bytes.base, power);
	                max = Math.pow(bytes.base, power + 1);

	                if (value === null || value === 0 || value >= min && value < max) {
	                    suffix += bytes.suffixes[power];

	                    if (min > 0) {
	                        value = value / min;
	                    }

	                    break;
	                }
	            }

	            output = numeral._.numberToFormat(value, format, roundingFunction);

	            return output + suffix;
	        },
	        unformat: function(string) {
	            var value = numeral._.stringToNumber(string),
	                power,
	                bytesMultiplier;

	            if (value) {
	                for (power = decimal.suffixes.length - 1; power >= 0; power--) {
	                    if (numeral._.includes(string, decimal.suffixes[power])) {
	                        bytesMultiplier = Math.pow(decimal.base, power);

	                        break;
	                    }

	                    if (numeral._.includes(string, binary.suffixes[power])) {
	                        bytesMultiplier = Math.pow(binary.base, power);

	                        break;
	                    }
	                }

	                value *= (bytesMultiplier || 1);
	            }

	            return value;
	        }
	    });
	})();


	(function() {
	        numeral.register('format', 'currency', {
	        regexps: {
	            format: /(\$)/
	        },
	        format: function(value, format, roundingFunction) {
	            var locale = numeral.locales[numeral.options.currentLocale],
	                symbols = {
	                    before: format.match(/^([\+|\-|\(|\s|\$]*)/)[0],
	                    after: format.match(/([\+|\-|\)|\s|\$]*)$/)[0]
	                },
	                output,
	                symbol,
	                i;

	            // strip format of spaces and $
	            format = format.replace(/\s?\$\s?/, '');

	            // format the number
	            output = numeral._.numberToFormat(value, format, roundingFunction);

	            // update the before and after based on value
	            if (value >= 0) {
	                symbols.before = symbols.before.replace(/[\-\(]/, '');
	                symbols.after = symbols.after.replace(/[\-\)]/, '');
	            } else if (value < 0 && (!numeral._.includes(symbols.before, '-') && !numeral._.includes(symbols.before, '('))) {
	                symbols.before = '-' + symbols.before;
	            }

	            // loop through each before symbol
	            for (i = 0; i < symbols.before.length; i++) {
	                symbol = symbols.before[i];

	                switch (symbol) {
	                    case '$':
	                        output = numeral._.insert(output, locale.currency.symbol, i);
	                        break;
	                    case ' ':
	                        output = numeral._.insert(output, ' ', i + locale.currency.symbol.length - 1);
	                        break;
	                }
	            }

	            // loop through each after symbol
	            for (i = symbols.after.length - 1; i >= 0; i--) {
	                symbol = symbols.after[i];

	                switch (symbol) {
	                    case '$':
	                        output = i === symbols.after.length - 1 ? output + locale.currency.symbol : numeral._.insert(output, locale.currency.symbol, -(symbols.after.length - (1 + i)));
	                        break;
	                    case ' ':
	                        output = i === symbols.after.length - 1 ? output + ' ' : numeral._.insert(output, ' ', -(symbols.after.length - (1 + i) + locale.currency.symbol.length - 1));
	                        break;
	                }
	            }


	            return output;
	        }
	    });
	})();


	(function() {
	        numeral.register('format', 'exponential', {
	        regexps: {
	            format: /(e\+|e-)/,
	            unformat: /(e\+|e-)/
	        },
	        format: function(value, format, roundingFunction) {
	            var output,
	                exponential = typeof value === 'number' && !numeral._.isNaN(value) ? value.toExponential() : '0e+0',
	                parts = exponential.split('e');

	            format = format.replace(/e[\+|\-]{1}0/, '');

	            output = numeral._.numberToFormat(Number(parts[0]), format, roundingFunction);

	            return output + 'e' + parts[1];
	        },
	        unformat: function(string) {
	            var parts = numeral._.includes(string, 'e+') ? string.split('e+') : string.split('e-'),
	                value = Number(parts[0]),
	                power = Number(parts[1]);

	            power = numeral._.includes(string, 'e-') ? power *= -1 : power;

	            function cback(accum, curr, currI, O) {
	                var corrFactor = numeral._.correctionFactor(accum, curr),
	                    num = (accum * corrFactor) * (curr * corrFactor) / (corrFactor * corrFactor);
	                return num;
	            }

	            return numeral._.reduce([value, Math.pow(10, power)], cback, 1);
	        }
	    });
	})();


	(function() {
	        numeral.register('format', 'ordinal', {
	        regexps: {
	            format: /(o)/
	        },
	        format: function(value, format, roundingFunction) {
	            var locale = numeral.locales[numeral.options.currentLocale],
	                output,
	                ordinal = numeral._.includes(format, ' o') ? ' ' : '';

	            // check for space before
	            format = format.replace(/\s?o/, '');

	            ordinal += locale.ordinal(value);

	            output = numeral._.numberToFormat(value, format, roundingFunction);

	            return output + ordinal;
	        }
	    });
	})();


	(function() {
	        numeral.register('format', 'percentage', {
	        regexps: {
	            format: /(%)/,
	            unformat: /(%)/
	        },
	        format: function(value, format, roundingFunction) {
	            var space = numeral._.includes(format, ' %') ? ' ' : '',
	                output;

	            if (numeral.options.scalePercentBy100) {
	                value = value * 100;
	            }

	            // check for space before %
	            format = format.replace(/\s?\%/, '');

	            output = numeral._.numberToFormat(value, format, roundingFunction);

	            if (numeral._.includes(output, ')')) {
	                output = output.split('');

	                output.splice(-1, 0, space + '%');

	                output = output.join('');
	            } else {
	                output = output + space + '%';
	            }

	            return output;
	        },
	        unformat: function(string) {
	            var number = numeral._.stringToNumber(string);
	            if (numeral.options.scalePercentBy100) {
	                return number * 0.01;
	            }
	            return number;
	        }
	    });
	})();


	(function() {
	        numeral.register('format', 'time', {
	        regexps: {
	            format: /(:)/,
	            unformat: /(:)/
	        },
	        format: function(value, format, roundingFunction) {
	            var hours = Math.floor(value / 60 / 60),
	                minutes = Math.floor((value - (hours * 60 * 60)) / 60),
	                seconds = Math.round(value - (hours * 60 * 60) - (minutes * 60));

	            return hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
	        },
	        unformat: function(string) {
	            var timeArray = string.split(':'),
	                seconds = 0;

	            // turn hours and minutes into seconds and add them all up
	            if (timeArray.length === 3) {
	                // hours
	                seconds = seconds + (Number(timeArray[0]) * 60 * 60);
	                // minutes
	                seconds = seconds + (Number(timeArray[1]) * 60);
	                // seconds
	                seconds = seconds + Number(timeArray[2]);
	            } else if (timeArray.length === 2) {
	                // minutes
	                seconds = seconds + (Number(timeArray[0]) * 60);
	                // seconds
	                seconds = seconds + Number(timeArray[1]);
	            }
	            return Number(seconds);
	        }
	    });
	})();

	return numeral;
	}));

	
	
	//=============================================================================================
	//Start of main code proper - handle the get request
	//=============================================================================================
	//
	if (request.getMethod() == 'GET') 
	{
		//Get parameters
		//
		var poId = request.getParameter('poid');
		
		var parentProduct = '';
		var parentDescription = '';
		var parentVendorName = '';
		
		//Read a purchase order
		//
		var poRecord = nlapiLoadRecord('purchaseorder', poId);
		var poLines = poRecord.getLineItemCount('item');
		var poBillAddress = nlapiEscapeXML(poRecord.getFieldValue('billaddress'));
		var poSubsidiaryAddress = "Harry Thomas Furniture Ltd\nThe Old Mill\nLondon Road\nLeicester\nLeicestershire"; //nlapiEscapeXML(poRecord.getFieldValue('custbody_subsidiary_address'));
		var poShipAddress = nlapiEscapeXML(poRecord.getFieldValue('shipaddress'));
		
		if (poBillAddress)
			{
				poBillAddress = poBillAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			}
		
		if (poSubsidiaryAddress)
			{
				poSubsidiaryAddress = poSubsidiaryAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			
			}
		
		if (poShipAddress)
			{
				poShipAddress = poShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
			}
		
		var poTranId = poRecord.getFieldValue('tranid');
		var poTranDate = poRecord.getFieldValue('trandate');
		var poDueDate = poRecord.getFieldValue('duedate');
		var poMemo = poRecord.getFieldValue('memo');
		var poEntity = nlapiLookupField('vendor', poRecord.getFieldValue('entity'), 'entityid', false);
		var poSubTotal= poRecord.getFieldValue('subtotal');
		var poTaxTotal= poRecord.getFieldValue('taxtotal');
		var poTotal= poRecord.getFieldValue('total');
		var poCurrency= poRecord.getFieldText('currency');
		var exchangeRate = Number(poRecord.getFieldValue('exchangerate'));
		
		poMemo = nlapiEscapeXML((poMemo == null ? '' : poMemo));
		poDueDate = (poDueDate == null ? '' : poDueDate);
		
		
		//Get the po lines by using a search
		//
		var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
				[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["mainline","is","F"], 
				   "AND", 
				   ["internalid","anyof",poId], 
				   "AND", 
				   ["taxline","is","F"]//, 
				   //"AND", 
				   //["item.matrixchild","is","T"]
				], 
				[
				   new nlobjSearchColumn("tranid",null,null), 
				   new nlobjSearchColumn("entity",null,null), 
				   new nlobjSearchColumn("item",null,null), 
				   new nlobjSearchColumn("rate",null,null), 
				   new nlobjSearchColumn("quantity",null,null), 
				   new nlobjSearchColumn("amount",null,null), 
				   new nlobjSearchColumn("salesdescription","item",null), 
				   new nlobjSearchColumn("parent","item",null).setSort(false), 
				   new nlobjSearchColumn("custitem19","item",null), 
				   new nlobjSearchColumn("custitem20","item",null), 
				   //new nlobjSearchColumn("custitem_ig_item_length","item",null), 
				   new nlobjSearchColumn("type","item",null)
				]
				);
		
		//Loop through the results to see how many parent items we have & build a blank matrix for each parent
		//
		var parentArray = {};
		var parentArrayDetails = {};
		
		for (var int = 0; int < purchaseorderSearch.length; int++) 
		{
			var parentId = purchaseorderSearch[int].getValue("parent","item",null);
			var item = purchaseorderSearch[int].getValue("item",null,null);
			
			//parentId = (parentId == null || parentId == '' ? NOPARENTID : parentId);
			parentId = (parentId == null || parentId == '' ? item : parentId);
			
			//build a blank matrix for each parent
			//
			if(!parentArray[parentId])
				{
					parentArray[parentId] = buildMatrix();
				}
			
			if(!parentArrayDetails[parentId])
			{
				var parentVendorName = '';
				
				for (var int2 = 1; int2 <= poLines; int2++) 
				{
					var poLineItem = poRecord.getLineItemValue('item', 'item', int2);
					
					if(poLineItem == item)
						{
							parentVendorName = poRecord.getLineItemValue('item', 'vendorname', int2);
							break;
						}
				}
				
				//if(parentId == NOPARENTID)
				if(parentId == item)
					{
						parentArrayDetails[parentId] = [purchaseorderSearch[int].getText("item",null,null), ''];
					}
				else
					{
						parentArrayDetails[parentId] = [purchaseorderSearch[int].getText("parent","item",null), (parentVendorName == null ? '' : parentVendorName)];
					}
				
			}
		
			
			var itemId = purchaseorderSearch[int].getValue("item",null,null);
			var itemQty = Math.abs(Number(purchaseorderSearch[int].getValue("quantity",null,null)));
			var itemRate = Math.abs(Number(purchaseorderSearch[int].getValue("rate",null,null)));
			var itemColour = purchaseorderSearch[int].getValue("custitem19","item",null);
			var itemSize = purchaseorderSearch[int].getValue("custitem20","item",null);
			var itemLength = ""; //purchaseorderSearch[int].getValue("custitem_ig_item_length","item",null);
			
			itemRate = (itemRate / exchangeRate).toFixed(2);
			
			var itemLengthColour = (itemLength == null ? '' : itemLength) + '|' + (itemColour == null ? '' : itemColour);
			
			parentArray[parentId][itemLengthColour][itemSize] = parentArray[parentId][itemLengthColour][itemSize] + itemQty; //Update the specific colour & size
			parentArray[parentId][itemLengthColour][TOTAL] = parentArray[parentId][itemLengthColour][TOTAL] + itemQty; //Update the row total
			parentArray[parentId][itemLengthColour][UNITCOST] = itemRate; //Update the rate
			parentArray[parentId][itemLengthColour][TOTALCOST] = parentArray[parentId][itemLengthColour][UNITCOST] * parentArray[parentId][itemLengthColour][TOTAL];
			parentArray[parentId][TOTAL][itemSize] = parentArray[parentId][TOTAL][itemSize] + itemQty; //Update the column total
			parentArray[parentId][TOTAL][TOTAL] = parentArray[parentId][TOTAL][TOTAL] + itemQty; //Update the grand total
			parentArray[parentId][TOTAL][UNITCOST] = itemRate; //Update the grand total
			parentArray[parentId][TOTAL][TOTALCOST] = parentArray[parentId][TOTAL][TOTALCOST] + parentArray[parentId][itemLengthColour][TOTALCOST];

		}
		
		for ( var parentId in parentArray) 
		{
			var sizeColourMatrix = parentArray[parentId];
			
			//Remove any un-populated rows in the matrix
			//
			for ( var colourId in sizeColourMatrix) 
			{
				if(sizeColourMatrix[colourId][TOTAL] == 0)
					{
						delete sizeColourMatrix[colourId];
					}
			}
			
			//Remove any un-populated columns in the matrix
			//
			var matrixColumnTotals = sizeColourMatrix[TOTAL];
			
			for ( var sizeId in matrixColumnTotals) 
			{
				var sizeTotal = Number(matrixColumnTotals[sizeId]);
				
				if(sizeTotal == 0)
					{
						for ( var colourId in sizeColourMatrix) 
						{
							delete sizeColourMatrix[colourId][sizeId];
						}
					}
			}
			
			 parentArray[parentId] = sizeColourMatrix;
		}
		

		//=============================================================================================
		//Print formatting
		//=============================================================================================
		//
		var sizeLookupArray = getDescriptions(SIZEID);
		var colourLookupArray = getDescriptions(COLOURID);
		var lengthLookupArray = getDescriptions(LENGTHID);
		
		var companyConfig = nlapiLoadConfiguration("companyinformation");
		var companyName = nlapiEscapeXML(companyConfig.getFieldValue("companyname"));
		var companyLogo = companyConfig.getFieldValue("pagelogo");
		var companyVatNo = companyConfig.getFieldValue("employerid");
		var companyAddress = companyConfig.getFieldValue("mainaddress_text").replace(/\r\n/g,'<br />');
		var formLogo = companyConfig.getFieldValue("formlogo");
		var logoFile = nlapiLoadFile(formLogo);
		var logoURL = nlapiEscapeXML(logoFile.getURL());
		
		//Start the xml off with the basic header info & the start of a pdfset
		//
		var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";

		//Header & style sheet
		//
		xml += "<pdf>"
		xml += "<head>";
        xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 8pt;table-layout: fixed;}";
        xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
        xml += "td {padding: 0px;vertical-align: top;font-size:8px;}";
        xml += "b {font-weight: bold;color: #333333;}";
        xml += "table.header td {padding: 0px;font-size: 8pt;}";
        xml += "table.footer td {padding: 0;font-size: 6pt;}";
        xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
        xml += "table.body td {padding-top: 0px;}";
        xml += "table.total {page-break-inside: avoid;}";
        xml += "table.message{border: 1px solid #dddddd;}";
        xml += "tr.totalrow {line-height: 200%;}";
        xml += "tr.messagerow{font-size: 6pt;}";
        xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
        xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
        xml += "td.address {padding-top: 0;font-size: 8pt;}";
        xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
        xml += "td.totalcell {border-bottom: 1px solid black;border-collapse: collapse;}";
        xml += "td.message{font-size: 8pt;}";
        xml += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
        //xml += "td.itemtable {border-bottom: 1px solid black}";
        xml += "span.title {font-size: 28pt;}";
        xml += "span.number {font-size: 16pt;}";
        xml += "span.itemname {font-weight: bold;line-height: 150%;}";
        xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
        xml += "</style>";

        //Macros
        //
		xml += "<macrolist>";
		
		xml += "<macro id=\"nlheader\">";
		xml += "<table class=\"header\" style=\"width: 100%;\">";
		xml += "<tr><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\"><img src=\"" + logoURL + "\" style=\"float: right; width:250px; height:75px;\" /></td></tr>";
		xml += "<tr><td><span style=\"font-size:24px;\">Purchase Order</span></td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td></tr>";
		xml += "</table>";
		xml += "<table class=\"header\" style=\"width: 100%;\">";
		xml += "<tr><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td><td align=\"right\">&nbsp;</td></tr>";
		xml += "<tr>";
		xml += "<td colspan=\"2\" rowspan=\"8\" class=\"addressheader\"><span style=\"font-size:8pt\"><b>Supplier Address:</b></span><br /><span class=\"nameandaddress\" style=\"font-size:8pt\">" + poBillAddress + "<br/></span></td>";
		xml += "<td align=\"right\" style=\"font-size:8pt\"></td>";
		xml += "<td colspan=\"2\" align=\"left\" rowspan=\"8\"><span class=\"nameandaddress\">" + companyAddress + "</span><br/>VAT No. " + companyVatNo + "<br /><br/><b>Email:</b> " + EMAILINFO + "<br /><b>Tel:</b> " + TELINFO + "</td>";
		xml += "</tr>";
		xml += "<tr><td align=\"right\"></td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\"></td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr><td align=\"right\" style=\"font-size:8pt\">&nbsp;</td></tr>";
		xml += "<tr style=\"font-size:8pt\"><td align=\"right\">&nbsp;</td></tr>";
		xml += "<tr style=\"font-size:8pt\"><td align=\"right\">&nbsp;</td></tr>";
		xml += "</table>"; 
		xml += "</macro>";
		
		xml += "<macro id=\"nlfooter\">";
		xml += "<table style=\"width: 100%;\">";
		//xml += "<tr><td><b>Standard Terms and Conditions apply. Invoices should quote the PO number above and any difference will result in delays in payment</b></td></tr>";
		//xml += "<tr><td><b>Invoices should quote the PO number above any any difference will result in delays in payment</b></td></tr>";
		//xml += "<tr><td>&nbsp;</td></tr>";
		xml += "</table>";
		xml += "<table class=\"footer\" style=\"width: 100%;\">";
		xml += "<tr><td><b>Standard Terms and Conditions apply. Invoices should quote the PO number above and any difference will result in delays in payment</b></td><td align=\"right\">Page <pagenumber/> of <totalpages/></td></tr>";
		xml += "</table></macro>";
		
		xml += "</macrolist>";
		xml += "</head>";
		
		//Body
		//
		xml += "<body header=\"nlheader\" header-height=\"250px\" footer=\"nlfooter\" footer-height=\"1%\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4-LANDSCAPE\">";

		//Header data
		//
		
		xml += "<table style=\"width: 100%;\">";
		xml += "<tr><td colspan=\"2\" class=\"addressheader\"><B>Shipping Address:</B></td><td></td><td></td><td></td></tr>";
		xml += "<tr><td colspan=\"2\" rowspan=\"8\" class=\"address\">" + poShipAddress + "</td><td></td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Purchase Order No.</b></td><td align=\"right\" style=\"font-size:8pt\">" + poTranId + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Purchase Order Date</b></td><td align=\"right\" style=\"font-size:8pt\">" + poTranDate + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Reference</b></td><td align=\"right\" style=\"font-size:8pt\">" + poMemo + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td align=\"left\" style=\"font-size:8pt\"><b>Account No</b></td><td align=\"right\" style=\"font-size:8pt\">" + poEntity + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td  align=\"left\" style=\"font-size:8pt\"><b>Delivery Date</b></td><td align=\"right\" style=\"font-size:8pt\">" + poDueDate + "</td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "<tr><td class=\"address\">&nbsp;</td><td></td><td></td></tr>";
		xml += "</table>";
				
		//xml += "<p></p>";
		
		for ( var parentId in parentArray) 
		{
			var sizeColourMatrix = parentArray[parentId];

			var parentDescription = '';
			var parentItem = '';
			var parentVendorName = '';
			
			/*
			if(parentId != NOPARENTID)
				{
					parentDescription = nlapiLookupField('item', parentId, 'description', false);
					parentItem = parentArrayDetails[parentId][0];
					parentVendorName = parentArrayDetails[parentId][1];
				}
			else
				{
					parentItem = parentArrayDetails[parentId][0];
					parentVendorName = parentArrayDetails[parentId][1];
					parentDescription = parentItem;
				}
			*/

			parentDescription = nlapiLookupField('item', parentId, 'description', false);
			parentItem = parentArrayDetails[parentId][0];
			parentVendorName = parentArrayDetails[parentId][1];
			parentDescription = (parentDescription == null || parentDescription == '' ? parentItem : parentDescription);
			
			//xml += "<span >";
			/*
			xml += "<table style=\"width: 100%\">";
			xml += "<tr>";
			xml += "<td width=\"50px\" align=\"left\" colspan=\"4\" style=\"font-size:12px;\"><b>" + nlapiEscapeXML(parentVendorName) + "</b></td>";
			xml += "<td align=\"left\" colspan=\"12\" style=\"font-size:12px;\"><b>" + nlapiEscapeXML(parentDescription) + "</b></td>";
			xml += "</tr>";
			xml += "</table>\n";
			*/
			
			//Loop round the remaining data in the matrix
			//
			var headingDone = false;
			
			for ( var colourId in sizeColourMatrix) 
			{
				if(colourId != TOTAL)
					{
						//Get the current row
						//
						var row = sizeColourMatrix[colourId];
						
						//Produce the headings
						//
						if(!headingDone)
						{
							headingDone = true;
							var colCount = Number(2);
							
							for ( var sizeId in row) 
							{
								colCount++;
							}
					
							
							xml += "<table page-break-inside=\"avoid\" class=\"itemtable\" style=\"width: 100%; border: 1px solid lightgrey; border-collapse: collapse;\">";
							xml += "<thead >";
							xml += "<tr >";
							xml += "<th colspan = \"" + colCount.toString() + "\">" + nlapiEscapeXML(parentVendorName) + " " + nlapiEscapeXML(parentDescription) + "</th>";
							xml += "</tr>";
							
							xml += "<tr >";
							
							//if(parentId == NOPARENTID)
							//	{
							//		xml += "<th style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\">&nbsp;</th>";
							//	}
							//else
							//	{
									xml += "<th style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\">Colour/Size</th>";
							//	}
							
							
							for ( var sizeId in row) 
							{
								//Get the size descriptions & print them out
								//
								var sizeDescription = '';
								
								switch(Number(sizeId))
								{
									case Number(TOTAL):
										sizeDescription = 'Total Qty';
										break;
										
									case Number(UNITCOST):
										sizeDescription = 'Unit Price';
										break;
										
									case Number(TOTALCOST):
										sizeDescription = 'Total Price';
										break;
										
									default:
										sizeDescription = sizeLookupArray[sizeId];
										sizeDescription = (sizeDescription == '' ? 'Qty' : sizeDescription);
										break;
								}
								
								xml += "<th style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"center\" colspan=\"1\">" + nlapiEscapeXML(sizeDescription) + "</th>";
							}
							
							xml += "</tr>";
							xml += "</thead>";
						}
					
						
						//Get the colour description so we can print it out
						//
						var colourDescription = '';
						var lengthDescription = '';
						
						xml += "<tr >";
						
						if (colourId == TOTAL)
						{
							xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\"><b>Total</b></td>";
						}
						else
						{
							colourDescription = colourLookupArray[colourId.split('|')[1]];
							lengthDescription = lengthLookupArray[colourId.split('|')[0]];
							
							colourDescription = (colourDescription == null || colourDescription == '' ? 'N/A' : colourDescription);
							
							xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" colspan=\"2\">" + nlapiEscapeXML(colourDescription) +  " " + nlapiEscapeXML(lengthDescription) + "</td>";
						}
						
						
						for ( var sizeId in row) 
						{
							var cell = row[sizeId];
							
							
							//Output the values in each cell
							//
							if (colourId == TOTAL)
							{
								cell = (cell == '0' ? '' : Number(cell).toFixed(0));
								
								xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"left\" colspan=\"1\"><b>" + cell + "</b></td>";
							}
							else
							{
								if(sizeId == TOTALCOST || sizeId == UNITCOST)
									{
										cell = (cell == '0' ? '' : Number(cell).toFixed(2));
										var tempNumeral = numeral(cell).format('0,0.00');
										
										xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"right\" colspan=\"1\"><b>" + tempNumeral + "</b></td>";
									}
								else
									{
										cell = (cell == '0' ? '' : Number(cell).toFixed(0));
									
										xml += "<td style=\"border: 1px solid lightgrey; border-collapse: collapse;\" align=\"center\" colspan=\"1\">" + cell + "</td>";
									}
							}
						}
						
						xml += "</tr>";
				}
			}
			
			//Finish the item table
			//
			xml += "</table>";
			//xml += "</span>";
			//xml += "<hr />";
			xml += "<p/>";
		}

		var tempNumeral = numeral(poSubTotal).format('0,0.00');
		
		xml += "<table class=\"total\" style=\"width: 100%;\">";
		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>Subtotal</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>" + tempNumeral + "</b></td>";
		xml += "</tr>";

		var tempNumeral = numeral(poTaxTotal).format('0,0.00');
		
		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\" align=\"right\"><b>VAT Total</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>" + tempNumeral + "</b></td>";
		xml += "</tr>";
		
		var tempNumeral = numeral(poTotal).format('0,0.00');
		
		xml += "<tr class=\"totalrow\">";
		xml += "<td colspan=\"3\">&nbsp;</td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>Total (" + poCurrency + ")</b></td>";
		xml += "<td class=\"totalcell\"  align=\"right\"><b>" + tempNumeral + "</b></td>";
		xml += "</tr>";
		
		xml += "<tr>";
		xml += "<td>&nbsp;</td>";
		xml += "</tr>";
		xml += "</table>";
		
		//Finish the body
		//
		xml += "</body>";
		
		//Finish the pdf
		//
		xml += "</pdf>";
		
		//Convert to pdf using the BFO library
		//
		var file = nlapiXMLToPDF(xml);

		//Send back the output in the response message
		//
		response.setContentType('PDF', 'Purchase Order ' + poTranId + '.pdf', 'inline');
		response.write(file.getValue());
	}	
}		

//=============================================================================================
//Functions
//=============================================================================================
//
function getDescriptions(listId)
{
	var listRecord = nlapiLoadRecord('customlist', listId);
	var values = listRecord.getLineItemCount('customvalue');
	var valuesArray = {};
	
	for (var int4 = 1; int4 <= values; int4++) 
	{
		var ValueId = listRecord.getLineItemValue('customvalue', 'valueid', int4);
		var ValueText = listRecord.getLineItemValue('customvalue', 'value', int4);
		
		valuesArray[ValueId] = ValueText;
	}
	
	valuesArray[''] = '';
	
	return valuesArray;
}

function buildMatrix()
{
	var colourRecord = nlapiLoadRecord('customlist', COLOURID);
	var sizeRecord = nlapiLoadRecord('customlist', SIZEID);
	var lengthRecord = nlapiLoadRecord('customlist', LENGTHID);
	
	var colours = colourRecord.getLineItemCount('customvalue');
	var sizes = sizeRecord.getLineItemCount('customvalue');
	var lengths = lengthRecord.getLineItemCount('customvalue');
	
	var colourSizeArray = {};
	var colourTotalAdded = false;
	
	//Loop round the colours
	//
	for (var int3 = 1; int3 <= colours+2; int3++) 
	{
		//TODO
		//Add in a loop to go round the lengths
		//
		var lengthValue = '';
		
		for (var int5 = 1; int5 <= lengths + 1; int5++) 
		{
			if(int5 == lengths + 1)
				{
					//Add a blank length for items that don't have a length
					//
					lengthValue = '';
				}
			else
				{
					lengthValue = lengthRecord.getLineItemValue('customvalue', 'valueid', int5);
				}
		
			var sizeArray = {};
			var colourValue = '';
			
			//Add in a entry for a blank colour
			//
			sizeArray[''] = 0;
			
			//Loop round all the sizes
			//
			for (var int4 = 1; int4 <= sizes; int4++) 
			{
				var sizeValue = sizeRecord.getLineItemValue('customvalue', 'valueid', int4);
				sizeArray[sizeValue] = 0;
			}
		
			//Insert the row summary as size value -1
			//
			sizeArray[TOTAL] = 0;
			
			//Insert the row unit cost
			//
			sizeArray[UNITCOST] = 0;
			
			//Insert the row unit cost
			//
			sizeArray[TOTALCOST] = 0;
			
			if(int3 == colours+1)
				{
					//Add in a blank colour value for items that don't have a colour
					//
					colourValue = '';
				}
			else
				{
					if(int3 == colours+2)
						{
							//Add in a dummy colour to hold the column totals
							//
							colourValue = TOTAL;
						}
					else
						{
							//Get the colour value from the list
							//
							colourValue = colourRecord.getLineItemValue('customvalue', 'valueid', int3);
						}
				}
			
			//Attach the size array to the respective length + colour
			//
			if(colourValue == TOTAL)
				{
					colourSizeArray[colourValue] = sizeArray;
				}
			else
				{
					colourSizeArray[lengthValue + '|' + colourValue] = sizeArray;
				}
			
		}
	}
	
	return colourSizeArray;

}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
	}

	return itemType;
}


