export type StringInterpolationValueDefinition = {
  name: string; // RANGE_NAME
  description?: string; // The name of the range of the product.
};

export type StringReplacementRuleTrigger = {
  name: StringInterpolationValueDefinition["name"];
  value: string;
};

export type StringReplacementDefinitionKey = string;
/**
 * One replacement rule for a single key.
 */
export type StringReplacementRule = {
  trigger?: StringReplacementRuleTrigger;
  //inlcudes interpolated values
  template: string;
};

export type StringReplacementsConfig = Record<StringReplacementDefinitionKey, StringReplacementRule[]>;

export type StringReplacementDefinition = {
  key: StringReplacementDefinitionKey; // PRODUCT_TITLE
  label: string; // 'Product Title'
  description?: string; // The name of the product being displayed.
  defaultTemplate: string; // '${RANGE_NAME}-${PRODUCT_NAME}'
  interpolationValues: StringInterpolationValueDefinition[]; // [{ name: 'RANGE_NAME', description: 'Range name' }, { name: 'PRODUCT_NAME', description: 'Product name' }]
};

export const optionNameReplacement: StringReplacementDefinition = {
  key: 'OPTION_NAME',
  label: 'Option Name',
  description: 'The name of the option being displayed.',
  defaultTemplate: '${OPTION_NAME}',
  interpolationValues: [{ name: 'OPTION_NAME', description: 'Option name' }],
}
/**
 * Setup payload type: full catalog of replaceable strings and their metadata.
 */
export type StringReplacements = StringReplacementDefinition[];
