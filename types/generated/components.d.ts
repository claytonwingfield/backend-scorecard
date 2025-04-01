import type { Schema, Struct } from '@strapi/strapi';

export interface NavigationExtraSubPages extends Struct.ComponentSchema {
  collectionName: 'components_navigation_extra_sub_pages';
  info: {
    displayName: 'extraSubPages';
    icon: 'apps';
  };
  attributes: {
    headerName: Schema.Attribute.String;
    isDominicanRepublic: Schema.Attribute.Boolean;
    isDropdown: Schema.Attribute.Boolean;
    name: Schema.Attribute.String;
    path: Schema.Attribute.String;
  };
}

export interface NavigationNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_navigation_items';
  info: {
    description: '';
    displayName: 'NavigationItem';
    icon: 'link';
  };
  attributes: {
    headerName: Schema.Attribute.String;
    isDominicanRepublic: Schema.Attribute.Boolean;
    isDropdown: Schema.Attribute.Boolean;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    path: Schema.Attribute.String;
    subPages: Schema.Attribute.Component<'navigation.sub-pages', true>;
  };
}

export interface NavigationSubPages extends Struct.ComponentSchema {
  collectionName: 'components_navigation_sub_pages';
  info: {
    description: '';
    displayName: 'subPages';
    icon: 'dashboard';
  };
  attributes: {
    extraSubPages: Schema.Attribute.Component<
      'navigation.extra-sub-pages',
      true
    >;
    headerName: Schema.Attribute.String;
    isDominicanRepublic: Schema.Attribute.Boolean;
    isDropdown: Schema.Attribute.Boolean;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    path: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'navigation.extra-sub-pages': NavigationExtraSubPages;
      'navigation.navigation-item': NavigationNavigationItem;
      'navigation.sub-pages': NavigationSubPages;
    }
  }
}
