<template>
    <div class="dashboard-container">
        <div>
            <div style="height: 15vh;" />
            <flip-clock
                mode="time"
                :flipper-container-class="'flip-container-custom'"
                :class="'flip-clock-custom'"
            />
            <p class="welcome">{{ welcome }}</p>
        </div>
    </div>
</template>

<script>
import { FlipClock } from 'zj-vue-flip-clock'
import 'zj-vue-flip-clock/dist/index.css'

export default {
    name: 'Dashboard',
    components: { FlipClock },
    data() {
        return {
            currTime: new Date(),
            welcome: ''
        }
    },
    beforeMount() {
        this.runClock();
    },
    methods: {
        runClock() {
            if (this.$route.path == '/dashboard') {
                this.currTime = new Date();
                this.welcome = this.getWelcome();

                setTimeout(() => {
                    this.runClock();
                }, 1000);
            }
        },
        getWelcome() {
            const hour = new Date().getHours();
            if (hour >= 23) {
                return '深夜了，请早点休息，保重身体！';
            } else if (hour >= 19) {
                return '晚上好，欢迎回来！';
            } else if (hour >= 13) {
                return '下午好，欢迎回来！';
            } else if (hour >= 11) {
                return '中午好，欢迎回来！';
            } else if (hour >= 9) {
                return '上午好，欢迎回来！';
            } else if (hour >= 5) {
                return '早上好，欢迎回来！';
            } else {
                return '深夜了，请早点休息，保重身体！';
            }
        }
    }
}
</script>

<style>
.dashboard-container {
    padding: 15px;
}

.flip-clock-custom em {
    color: #5b626d;
    font-size: 88px;
}

.flip-container-custom .digital:before,
.flip-container-custom .digital:after {
    background-color:#5b626d;
}

.welcome {
    margin: 80px 0 0 0;
    padding-left: 40px;
    text-align: center;
    text-shadow: 1px 0px 1px #efeff0, 1px 0px 1px #efeff0, 1px 0px 1px #888d95,1px 0px 1px #888d95;
    color: #5b626d;
    font-weight: 700;
    font-size: 77px;
}
</style>
