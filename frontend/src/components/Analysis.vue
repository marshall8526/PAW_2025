<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([ CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent ])

export default {
    props: [ 'session' ],
    emits: [ 'saved', 'error' ],
    components: { VChart },
    data() {
        return {
            option: {
                legend: {
                    data: [ 'Liczba pracowników', 'Wiek menedżera' ]
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Liczba pracowników',
                        data: [],
                        type: 'bar',
                        title: 'Liczba pracowników',
                    },
                    {
                        name: 'Wiek menedżera',
                        data: [],
                        type: 'bar',
                        title: 'Wiek menedżera'
                    }
                ]
            }
        }
    },
    mounted() {
        const queryString = { skip: 0, limit: 10 }
        fetch('/api/project?' + new URLSearchParams(queryString).toString())
        .then(res => res.json().then(result => {
            result.data.forEach(element => {
                element.managerName = element.manager[0] ? element.manager[0].firstName + ' ' + element.manager[0].lastName : '- bez przydziału -'
                element.numWorkers = element.worker_ids.length
            })
            this.option.xAxis.data = result.data.map(element => element.name)
            this.option.series[0].data = result.data.map(element => element.numWorkers)
            this.option.series[1].data = result.data.map(element => element.manager[0].birthDate ? (new Date() - new Date(element.manager[0].birthDate)) / 1000 / 60 / 60 / 24 / 365.25 : 0)
        }))
    }
}
</script>

<template>
    <h1>Analiza</h1>
    <v-chart class="chart" :option="option" autoresize/>
</template>

<style scoped>
.chart { height: 50vh; }
</style>