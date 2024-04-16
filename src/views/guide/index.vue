<template>
    <div class="app-container markdown-body">
        <vue-markdown style="width: 800px; margin: 0 auto;" :source="markdownData" />
    </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import axios from 'axios'

import 'github-markdown-css/github-markdown.css'

export default {
    name: 'Guide',
    components: { VueMarkdown },
    data() {
        return {
            markdownData: ""
        }
    },
    mounted() {
        this.getContent();
    },
    methods: {
        getContent() {
            axios.get('static/doc/guide.md')
                .then(res => {
                    this.markdownData = res.data
                })
        }
    }
}
</script>
