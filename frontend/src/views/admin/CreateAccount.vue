<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useScopedI18n } from '@/i18n/app'

import { useGlobalState } from '../../store'
import { api } from '../../api'
import AddressCredentialModal from '../../components/AddressCredentialModal.vue'

const {
    loading, openSettings,
} = useGlobalState()
const message = useMessage()

const { t } = useScopedI18n('views.admin.CreateAccount')

const enablePrefix = ref(false)
const enableRandomSubdomain = ref(false)
const customSubdomain = ref("")
const emailName = ref("")
const emailDomain = ref("")
const showReultModal = ref(false)
const result = ref("")
const addressPassword = ref("")
const createdAddress = ref("")

const canUseRandomSubdomain = computed(() => {
    if (!emailDomain.value) {
        return false
    }
    return (openSettings.value.randomSubdomainDomains || []).includes(emailDomain.value)
})

watch(canUseRandomSubdomain, (enabled) => {
    if (!enabled) {
        enableRandomSubdomain.value = false
        customSubdomain.value = ''
    }
})

watch(enableRandomSubdomain, (enabled) => {
    if (enabled) {
        customSubdomain.value = ''
    }
})

watch(customSubdomain, (value) => {
    if (value?.trim()) {
        enableRandomSubdomain.value = false
    }
})

const newEmail = async () => {
    if (!emailName.value || !emailDomain.value) {
        message.error(t('fillInAllFields'))
        return
    }
    try {
        const finalDomain = customSubdomain.value?.trim()
            ? `${customSubdomain.value.trim().toLowerCase()}.${emailDomain.value}`
            : emailDomain.value
        const res = await api.fetch(`/admin/new_address`, {
            method: 'POST',
            body: JSON.stringify({
                enablePrefix: enablePrefix.value,
                enableRandomSubdomain: enableRandomSubdomain.value,
                name: emailName.value,
                domain: finalDomain,
            })
        })
        result.value = res["jwt"];
        addressPassword.value = res["password"] || '';
        createdAddress.value = res["address"] || '';
        message.success(t('successTip'))
        showReultModal.value = true
    } catch (error) {
        message.error(error.message || "error");
    }
}

onMounted(async () => {
    emailDomain.value = openSettings.value.domains?.[0]?.value || ""
})
</script>

<template>
    <div class="center">
        <AddressCredentialModal v-model:show="showReultModal" :address="createdAddress" :jwt="result"
            :address-password="addressPassword" />
        <n-card :bordered="false" embedded style="max-width: 600px;">
            <n-form-item-row v-if="openSettings.prefix" :label="t('enablePrefix')">
                <n-switch v-model:value="enablePrefix" :round="false" />
            </n-form-item-row>
            <n-form-item-row :label="t('address')">
                <n-input-group>
                    <n-input-group-label v-if="enablePrefix && openSettings.prefix">
                        {{ openSettings.prefix }}
                    </n-input-group-label>
                    <n-input v-model:value="emailName" />
                    <n-input-group-label>@</n-input-group-label>
                    <n-select v-model:value="emailDomain" :consistent-menu-width="false"
                        :options="openSettings.domains" />
                </n-input-group>
            </n-form-item-row>
            <n-form-item-row v-if="canUseRandomSubdomain" :show-feedback="false">
                <n-flex vertical style="width: 100%; gap: 10px; margin-bottom: 12px;">
                    <n-checkbox v-model:checked="enableRandomSubdomain">
                        {{ t('enableRandomSubdomain') }}
                    </n-checkbox>
                    <p style="margin: 0; opacity: 0.75; line-height: 1.6;">
                        {{ t('randomSubdomainTip') }}
                    </p>
                    <n-input
                        v-model:value="customSubdomain"
                        :disabled="enableRandomSubdomain"
                        placeholder="自定义子域名（可选；启用随机后不可填写）"
                    />
                </n-flex>
            </n-form-item-row>
            <n-button @click="newEmail" type="primary" block :loading="loading">
                {{ t('creatNewEmail') }}
            </n-button>
        </n-card>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
    margin: 20px;
}
</style>
