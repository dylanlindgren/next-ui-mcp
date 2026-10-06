export interface HdsComponentDefinition {
  tag: string;
  packageName: string;
  searchTerms: string[];
}

type HdsComponentSource = {
  tag: string;
  packageName: string;
  aliases?: string[];
};

const HDS_COMPONENT_SOURCES: HdsComponentSource[] = [
  { tag: 'now-accordion', packageName: '@servicenow/now-accordion', aliases: ['accordion'] },
  { tag: 'now-accordion-item', packageName: '@servicenow/now-accordion', aliases: ['accordion'] },
  { tag: 'now-alert', packageName: '@servicenow/now-alert', aliases: ['alert'] },
  { tag: 'now-alert-list', packageName: '@servicenow/now-alert', aliases: ['alert'] },
  { tag: 'now-animation', packageName: '@servicenow/now-animation', aliases: ['animation'] },
  { tag: 'now-avatar', packageName: '@servicenow/now-avatar', aliases: ['avatar'] },
  { tag: 'now-badge', packageName: '@servicenow/now-badge', aliases: ['badge'] },
  { tag: 'now-breadcrumbs', packageName: '@servicenow/now-breadcrumbs', aliases: ['breadcrumbs'] },
  { tag: 'now-button', packageName: '@servicenow/now-button', aliases: ['button'] },
  { tag: 'now-button-bare', packageName: '@servicenow/now-button', aliases: ['button'] },
  { tag: 'now-button-circular', packageName: '@servicenow/now-button', aliases: ['button'] },
  { tag: 'now-button-iconic', packageName: '@servicenow/now-button', aliases: ['button'] },
  { tag: 'now-button-stateful', packageName: '@servicenow/now-button', aliases: ['button'] },
  { tag: 'now-card', packageName: '@servicenow/now-card', aliases: ['card'] },
  { tag: 'now-card-actions', packageName: '@servicenow/now-card', aliases: ['card'] },
  { tag: 'now-card-divider', packageName: '@servicenow/now-card', aliases: ['card'] },
  { tag: 'now-card-footer', packageName: '@servicenow/now-card', aliases: ['card'] },
  { tag: 'now-card-header', packageName: '@servicenow/now-card', aliases: ['card'] },
  { tag: 'now-carousel-text', packageName: '@servicenow/now-carousel-text', aliases: ['carousel-text'] },
  { tag: 'now-chart-bar', packageName: '@servicenow/now-chart-bar', aliases: ['chart-bar'] },
  { tag: 'now-chart-donut-pie', packageName: '@servicenow/now-chart-donut-pie', aliases: ['chart-donut-pie'] },
  { tag: 'now-chart-navigator', packageName: '@servicenow/now-chart-navigator', aliases: ['chart-navigator'] },
  {
    tag: 'sn-chart-screen-reader-table',
    packageName: '@devsnc/sn-chart-screen-reader-table',
    aliases: ['chart-screen-reader-table']
  },
  { tag: 'now-chart-sparkline', packageName: '@servicenow/now-chart-sparkline', aliases: ['chart-sparkline'] },
  { tag: 'now-chart-timeseries', packageName: '@servicenow/now-chart-timeseries', aliases: ['chart-timeseries'] },
  { tag: 'now-checkbox', packageName: '@servicenow/now-checkbox', aliases: ['checkbox'] },
  { tag: 'now-collapse', packageName: '@servicenow/now-collapse', aliases: ['collapse'] },
  { tag: 'now-collapse-trigger', packageName: '@servicenow/now-collapse', aliases: ['collapse'] },
  { tag: 'now-color-selector', packageName: '@servicenow/now-color-selector', aliases: ['color-selector'] },
  { tag: 'now-color-selector-panel', packageName: '@servicenow/now-color-selector', aliases: ['color-selector'] },
  {
    tag: 'now-color-selector-popover-content',
    packageName: '@servicenow/now-color-selector',
    aliases: ['color-selector']
  },
  { tag: 'now-content-tree', packageName: '@servicenow/now-content-tree', aliases: ['content-tree'] },
  { tag: 'now-date-time', packageName: '@servicenow/now-date-time', aliases: ['date-time'] },
  { tag: 'now-date-time-calendar', packageName: '@servicenow/now-date-time', aliases: ['date-time'] },
  { tag: 'now-date-time-interval', packageName: '@servicenow/now-date-time', aliases: ['date-time'] },
  { tag: 'now-input-date-time', packageName: '@servicenow/now-date-time', aliases: ['date-time'] },
  { tag: 'now-dropdown', packageName: '@servicenow/now-dropdown', aliases: ['dropdown'] },
  { tag: 'now-dropdown-list', packageName: '@servicenow/now-dropdown', aliases: ['dropdown'] },
  { tag: 'now-dropdown-panel', packageName: '@servicenow/now-dropdown', aliases: ['dropdown'] },
  { tag: 'now-flyout-menu', packageName: '@servicenow/now-flyout-menu', aliases: ['flyout-menu'] },
  { tag: 'now-flyout-menu-list', packageName: '@servicenow/now-flyout-menu', aliases: ['flyout-menu'] },
  { tag: 'now-grouped-button', packageName: '@servicenow/now-grouped-button', aliases: ['grouped-button'] },
  { tag: 'now-heading', packageName: '@servicenow/now-heading', aliases: ['heading'] },
  { tag: 'now-highlighted-value', packageName: '@servicenow/now-highlighted-value', aliases: ['highlighted-value'] },
  { tag: 'now-icon', packageName: '@servicenow/now-icon', aliases: ['icon'] },
  { tag: 'now-icon-animated', packageName: '@servicenow/now-icon', aliases: ['icon'] },
  { tag: 'now-icon-presence', packageName: '@servicenow/now-icon', aliases: ['icon'] },
  { tag: 'now-iframe', packageName: '@servicenow/now-iframe', aliases: ['iframe'] },
  { tag: 'now-illustration', packageName: '@servicenow/now-illustration', aliases: ['illustration'] },
  { tag: 'now-illustration-custom', packageName: '@servicenow/now-illustration', aliases: ['illustration'] },
  { tag: 'now-image', packageName: '@servicenow/now-image', aliases: ['image'] },
  { tag: 'now-input', packageName: '@servicenow/now-input', aliases: ['input'] },
  { tag: 'now-input-password', packageName: '@servicenow/now-input', aliases: ['input'] },
  { tag: 'now-input-phone', packageName: '@servicenow/now-input', aliases: ['input'] },
  { tag: 'now-input-url', packageName: '@servicenow/now-input', aliases: ['input'] },
  { tag: 'now-label-value-inline', packageName: '@servicenow/now-label-value', aliases: ['label-value'] },
  { tag: 'now-label-value-stacked', packageName: '@servicenow/now-label-value', aliases: ['label-value'] },
  { tag: 'now-label-value-tabbed', packageName: '@servicenow/now-label-value', aliases: ['label-value'] },
  { tag: 'now-legacy-icon', packageName: '@servicenow/now-legacy-icon', aliases: ['legacy-icon'] },
  { tag: 'now-loader', packageName: '@servicenow/now-loader', aliases: ['loader'] },
  { tag: 'now-loader-custom', packageName: '@servicenow/now-loader', aliases: ['loader'] },
  { tag: 'now-loader-skeleton', packageName: '@servicenow/now-loader', aliases: ['loader'] },
  { tag: 'now-loader-skeleton-custom', packageName: '@servicenow/now-loader', aliases: ['loader'] },
  { tag: 'now-message', packageName: '@servicenow/now-message', aliases: ['message'] },
  { tag: 'now-modal', packageName: '@servicenow/now-modal', aliases: ['modal'] },
  { tag: 'now-modeless-dialog', packageName: '@servicenow/now-modeless-dialog', aliases: ['modeless-dialog'] },
  { tag: 'now-pagination-control', packageName: '@servicenow/now-pagination-control', aliases: ['pagination-control'] },
  { tag: 'now-pill', packageName: '@servicenow/now-pill', aliases: ['pill'] },
  { tag: 'now-popover', packageName: '@servicenow/now-popover', aliases: ['popover'] },
  { tag: 'now-popover-panel', packageName: '@servicenow/now-popover', aliases: ['popover'] },
  { tag: 'now-progress-bar', packageName: '@servicenow/now-progress-bar', aliases: ['progress-bar'] },
  { tag: 'now-radio-buttons', packageName: '@servicenow/now-radio-buttons', aliases: ['radio-buttons'] },
  { tag: 'now-rich-text', packageName: '@servicenow/now-rich-text', aliases: ['rich-text'] },
  { tag: 'now-select', packageName: '@servicenow/now-select', aliases: ['select'] },
  { tag: 'now-sheet', packageName: '@servicenow/now-sheet', aliases: ['sheet'] },
  { tag: 'now-split-button', packageName: '@servicenow/now-split-button', aliases: ['split-button'] },
  { tag: 'now-stepper', packageName: '@servicenow/now-stepper', aliases: ['stepper'] },
  { tag: 'now-stylized-text', packageName: '@servicenow/now-stylized-text', aliases: ['stylized-text'] },
  { tag: 'now-tabs', packageName: '@servicenow/now-tabs', aliases: ['tabs'] },
  { tag: 'now-tabs-vertical', packageName: '@servicenow/now-tabs', aliases: ['tabs'] },
  { tag: 'now-template-card-assist', packageName: '@servicenow/now-template-card', aliases: ['template-card'] },
  { tag: 'now-template-card-attachment', packageName: '@servicenow/now-template-card', aliases: ['template-card'] },
  { tag: 'now-template-card-omnichannel', packageName: '@servicenow/now-template-card', aliases: ['template-card'] },
  { tag: 'now-template-message-empty-state', packageName: '@servicenow/now-template-message', aliases: ['template-message'] },
  { tag: 'now-text-link', packageName: '@servicenow/now-text-link', aliases: ['text-link'] },
  { tag: 'now-textarea', packageName: '@servicenow/now-textarea', aliases: ['textarea'] },
  { tag: 'now-toggle', packageName: '@servicenow/now-toggle', aliases: ['toggle'] },
  { tag: 'now-tooltip', packageName: '@servicenow/now-tooltip', aliases: ['tooltip'] },
  { tag: 'now-typeahead', packageName: '@servicenow/now-typeahead', aliases: ['typeahead'] },
  { tag: 'now-typeahead-multi', packageName: '@servicenow/now-typeahead', aliases: ['typeahead'] }
];

function humanize(name: string): string {
  return name.replace(/[-/]/g, ' ');
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildSearchTerms(tag: string, packageName: string, aliases: string[] = []): string[] {
  const barePackageName = packageName.replace(/^@[^/]+\//, '');

  return dedupeStrings([
    tag,
    packageName,
    barePackageName,
    humanize(tag),
    humanize(barePackageName),
    ...aliases,
    ...aliases.map(humanize),
    ...tag.split('-').filter(Boolean),
    ...barePackageName.split('-').filter(Boolean)
  ]);
}

export const HDS_COMPONENTS: HdsComponentDefinition[] = HDS_COMPONENT_SOURCES.map(
  ({ tag, packageName, aliases }) => ({
    tag,
    packageName,
    searchTerms: buildSearchTerms(tag, packageName, aliases)
  })
);

const HDS_COMPONENT_MAP = new Map(HDS_COMPONENTS.map((component) => [component.tag, component]));

export function getHdsComponent(tag: string): HdsComponentDefinition | undefined {
  return HDS_COMPONENT_MAP.get(tag);
}

export function isKnownHdsComponentTag(tag: string): boolean {
  return HDS_COMPONENT_MAP.has(tag);
}