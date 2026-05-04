<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted, watch } from 'vue';

import { useGlobalState } from '../../store'
import { api } from '../../api'
import { processItem } from '../../utils/email-parser'
import { utcToLocalDate } from '../../utils';

const { telegramApp, loading, useUTCDate } = useGlobalState()
const route = useRoute()
const message = useMessage()

const curMail = ref({});
const showTextMail = ref(true)

watch(telegramApp, async () => {
    if (telegramApp.value.initData) {
        curMail.value = await fetchMailData();
    }
});

const fetchMailData = async () => {
    try {
        const res = await api.fetch(`/telegram/get_mail`, {
            method: 'POST',
            body: JSON.stringify({
                initData: telegramApp.value.initData,
                mailId: route.query.mail_id
            })
        });
        loading.value = true;
        return await processItem(res);
    }
    catch (error) {
        console.error(error);
        return {};
    }
    finally {
        loading.value = false;
    }
};

const externalMailUrl = computed(() => {
    if (!curMail.value?.id) return ''
    return `${window.location.origin}/?mail_id=${curMail.value.id}`
})

const openInBrowser = () => {
    if (!externalMailUrl.value) return
    window.open(externalMailUrl.value, '_blank', 'noopener,noreferrer')
}

const copyTextVersion = async () => {
    const text = curMail.value?.text || ''
    if (!text) {
        message.error('暂无可复制的纯文本内容')
        return
    }
    try {
        await navigator.clipboard.writeText(text)
        message.success('纯文本内容已复制')
    } catch (error) {
        console.error(error)
        message.error('复制失败')
    }
}

onMounted(async () => {
    curMail.value = await fetchMailData();
});
</script>

<template>
    <div class="center">
        <n-card :bordered="false" embedded v-if="curMail.message || curMail.text" class="mail-card">
            <n-space vertical size="small" style="width: 100%;">
                <n-space wrap>
                    <n-tag type="info">
                        ID: {{ curMail.id }}
                    </n-tag>
                    <n-tag type="info">
                        Date: {{ utcToLocalDate(curMail.created_at, useUTCDate) }}
                    </n-tag>
                    <n-tag type="info">
                        FROM: {{ curMail.source }}
                    </n-tag>
                    <n-tag v-if="curMail.address" type="info">
                        TO: {{ curMail.address }}
                    </n-tag>
                </n-space>

                <n-space>
                    <n-button size="small" tertiary type="primary" @click="showTextMail = !showTextMail">
                        {{ showTextMail ? '查看 HTML' : '查看纯文本' }}
                    </n-button>
                    <n-button size="small" tertiary @click="copyTextVersion">
                        复制纯文本
                    </n-button>
                    <n-button size="small" tertiary type="info" @click="openInBrowser">
                        在浏览器打开
                    </n-button>
                </n-space>

                <pre v-if="showTextMail" class="mail-text">{{ curMail.text || '无可用纯文本内容，请尝试切换 HTML 或在浏览器打开。' }}</pre>
                <iframe v-else :srcdoc="curMail.message" class="mail-iframe"></iframe>
            </n-space>
        </n-card>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 16px;
}

.mail-card {
    width: min(960px, 100%);
}

.mail-text {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--n-color-embedded);
    border-radius: 8px;
    padding: 12px;
    line-height: 1.7;
    min-height: 320px;
}

.mail-iframe {
    margin-top: 10px;
    width: 100%;
    min-height: 70vh;
    border: none;
    border-radius: 8px;
    background: #fff;
}
</style>
