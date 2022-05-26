import { watch, reactive, onBeforeMount, computed, h, getCurrentInstance } from 'vue';
import type { ToRefs, Slots, ComputedRef } from 'vue';
import { Table, DefaultRow } from '../../table-types';
import { Column, TableColumnProps, TableColumn } from './column-types';
import { TableStore } from '../../store/store-types';
import { formatWidth } from '../../utils';
import { cellMap } from './config';

export function createColumn(props: ToRefs<TableColumnProps>, slots: Slots): Column {
  const {
    type,
    field,
    header,
    sortable,
    sortDirection,
    width,
    minWidth,
    maxWidth,
    formatter,
    sortMethod,
    filterable,
    filterList,
    filterMultiple,
    order,
    fixedLeft,
    fixedRight,
    align,
    showOverflowTooltip,
    resizeable,
  } = props;
  const column: Column = reactive({});
  column.type = type.value;

  function renderHeader(columnItem: Column, store: TableStore) {
    if (slots.header) {
      return slots.header(columnItem);
    }
    return cellMap[type.value || 'default'].renderHeader(columnItem, store);
  }

  function renderCell(rowData: DefaultRow, columnItem: Column, store: TableStore, rowIndex: number) {
    if (slots.default && columnItem.type !== 'expand') {
      return slots.default({ row: rowData, rowIndex });
    }
    return cellMap[type.value || 'default'].renderCell(rowData, columnItem, store, rowIndex);
  }

  watch(
    [field, header, order],
    ([fieldVal, headerVal, orderVal]) => {
      column.field = fieldVal;
      column.header = headerVal;
      column.order = orderVal;
    },
    { immediate: true }
  );

  // 排序功能
  watch(
    [sortable, sortDirection, sortMethod],
    ([sortableVal, sortDirectionVal, sortMethodVal]) => {
      column.sortable = sortableVal;
      column.sortDirection = sortDirectionVal;
      column.sortMethod = sortMethodVal;
    },
    { immediate: true }
  );

  // 过滤功能
  watch(
    [filterable, filterList, filterMultiple],
    ([filterableVal, filterListVal, filterMultipleVal]) => {
      column.filterable = filterableVal;
      column.filterMultiple = filterMultipleVal;
      column.filterList = filterListVal;
    },
    { immediate: true }
  );

  // 固定左右功能
  watch(
    [fixedLeft, fixedRight],
    ([left, right]) => {
      column.fixedLeft = left;
      column.fixedRight = right;
    },
    { immediate: true }
  );

  watch(
    align,
    (alignVal) => {
      column.align = alignVal;
    },
    { immediate: true }
  );

  watch(
    showOverflowTooltip,
    (showVal) => {
      column.showOverflowTooltip = showVal;
    },
    { immediate: true }
  );

  watch(
    resizeable,
    (resizeVal) => {
      column.resizeable = resizeVal;
    },
    { immediate: true }
  );

  // 宽度
  watch(
    [width, minWidth, maxWidth],
    ([widthVal, minWidthVal, maxWidthVal]) => {
      column.width = formatWidth(widthVal);
      column.minWidth = minWidthVal;
      column.maxWidth = maxWidthVal;
      column.realWidth = column.width;
    },
    { immediate: true }
  );

  // 基础渲染功能
  onBeforeMount(() => {
    column.renderHeader = renderHeader;
    column.renderCell = renderCell;
    column.formatter = formatter?.value;
    column.customFilterTemplate = slots.customFilterTemplate;
    column.subColumns = slots.subColumns;
  });

  return column;
}

export function useRender<T>(): {
  columnOrTableParent: ComputedRef<Table<T> | TableColumn>;
  getColumnIndex: (children: Array<unknown>, child: unknown) => number;
} {
  const instance = getCurrentInstance() as TableColumn;
  const columnOrTableParent = computed(() => {
    let parent: any = instance?.parent;
    while (parent && !parent.tableId && !parent.columnId) {
      parent = parent.parent;
    }
    return parent;
  });
  const getColumnIndex = (children: Array<unknown>, child: unknown) => {
    return Array.prototype.indexOf.call(children, child);
  };

  return { columnOrTableParent, getColumnIndex };
}
