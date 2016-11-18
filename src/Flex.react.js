import styles from './Flex.scss';

import React from 'react';
import {flatten, omit, values} from 'lodash';

const responsiveModifiers = ['', 'Xs', 'GtXs', 'Sm', 'GtSm', 'Md', 'GtMd', 'Lg', 'GtLg'];

const baseAttributes = ['layout', 'flex', 'order', 'offset', 'align', 'hide', 'show'];

const otherFlexAttributes = ['layoutWrap', 'layoutNoWrap', 'layoutFill', 'layoutMargin', 'layoutPadding'];

/**
 *
 * {
 *   layout: ['layout', 'layoutSm', ... , 'layoutGtLg'],
 *   flex: ['flex', 'flexSm', ... , 'flexGtLg'],
 *   ...
 * }
 *
 * @type {Object}
 */
const responsiveAttributes = baseAttributes.reduce((result, attrName) => {
  result[attrName] = responsiveModifiers.map(val => attrName + val);
  return result;
}, {});

const allFlexAttributes = flatten(values(responsiveAttributes)).concat(otherFlexAttributes).concat(['divider', 'wrap', 'tag']);

/**
 * Converts camelCased string to snake-cased string.
 *
 * Example: camelCaseToSnakeCase('helloWorld') // => 'hello-world'
 *
 * @param {String} value
 * @returns {String}
 */
const camelCaseToSnakeCase = value => {
  return value.replace(/(?:[A-Z]+|[0-9]+)/g, (match, index) => {
    return index === 0 ? match : `-${match}`;
  }).toLowerCase();
};

/**
 * Capitalizes a given string
 *
 * Example: capitalize('hello') // => 'Hello'
 *
 * @param {String} value
 * @returns {String}
 */
const capitalize = value => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Converts attribute's key/value pair
 * to css class name.
 *
 * Example: attributeToClass('layoutGtMd', 'row') // => 'layout-gt-md-row'
 * Example2: attributeToClass('alignGtMd', 'start start', 'layout') // => 'layout-align-gt-md-start-start'
 *
 * @param {String} attrName
 * @param {String} attrValue
 * @param {String=} prefix
 */
const attributeToClass = (attrName, attrValue, prefix = '') => {
  const normalizedAttrValue = typeof attrValue === 'boolean' && attrValue ? '' : attrValue;
  const snakeCasedAttrValue = normalizedAttrValue.replace(' ', '-');
  const className = prefix + capitalize(attrName) + capitalize(snakeCasedAttrValue);
  return camelCaseToSnakeCase(className);
};

/**
 * Maps attributes to real component's css classes.
 *
 * Example:
 * attributesToClasses(['layoutGtMdRow'], props) // => ['Flex__layout-gt-md-row__8hgt2']
 *
 * @param {String[]} attributes
 * @param {Object} props - Component's props
 * @param {String=} prefix
 * @returns {*}
 */
const attributesToClasses = (attributes, props, prefix = '') => {
  return attributes
    .filter(attrName => attrName in props)
    .map(attrName => styles[attributeToClass(attrName, props[attrName], prefix)]);
};

export default class Flex extends React.Component {
  // TODO generate propTypes for attributes

  static propTypes = {
    divider: React.PropTypes.bool,
    wrap: React.PropTypes.bool,
    /** Custom class name */
    className: React.PropTypes.string,
    tag: React.PropTypes.node,
    children: React.PropTypes.node
  };


  render() {
    const {className, tag, ...rest} = this.props;

    // TODO how could we refactor this?

    const layoutClasses = attributesToClasses(responsiveAttributes.layout, this.props);
    const flexClasses = attributesToClasses(responsiveAttributes.flex, this.props);
    const orderClasses = attributesToClasses(responsiveAttributes.order, this.props, 'flex');
    const offsetClasses = attributesToClasses(responsiveAttributes.offset, this.props, 'flex');
    const alignmentClasses = attributesToClasses(responsiveAttributes.align, this.props, 'layout');
    const hideClasses = attributesToClasses(responsiveAttributes.hide, this.props);
    const showClasses = attributesToClasses(responsiveAttributes.show, this.props);
    const dividerClass = this.props.divider ? [styles.divider] : [];
    const otherFlexClasses = attributesToClasses(otherFlexAttributes, this.props);
    const classNames = (className || '').split(' ');

    const classes = layoutClasses
      .concat(flexClasses, orderClasses, offsetClasses, alignmentClasses)
      .concat(showClasses, hideClasses, dividerClass, classNames, otherFlexClasses)
      .join(' ');

    const FlexComponent = tag || 'div';
    // remove Unknown Prop Warning for > react-5.2 https://facebook.github.io/react/warnings/unknown-prop.html
    const cleanProps = omit(rest, allFlexAttributes);

    return (
      <FlexComponent className={classes} {...cleanProps}/>
    );
  }
}
