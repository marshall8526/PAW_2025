<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide } from 'vue';

export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ]
}
</script>

<template>
    <h1>Analiza</h1>
</template>
