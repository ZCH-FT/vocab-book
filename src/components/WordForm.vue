<script setup lang="ts">
import type {FormInstance, FormRules} from 'element-plus'
import {ref} from 'vue'

const model = defineModel<{en: string; zh: string}>({required: true})

withDefaults(defineProps<{
    loading?: boolean
    layout?: 'row' | 'column'
    submitText?: string
}>(), {
    loading: false,
    layout: 'row',
    submitText: '确定',
})

const emit = defineEmits<{(e: 'submit'): void}>()

const formRef = ref<FormInstance>()

const rules: FormRules = {
    en: [{ required: true, whitespace: true, message: '请输入英文', trigger: 'blur'}],
    zh: [{ required: true, whitespace: true, message: '请输入中文', trigger: 'blur'}]
}

async function handleSubmit() {
    const ok = await formRef.value?.validate().catch(()=>false)
    if(!ok) {
            return
    }
    emit('submit')
}
</script>

<template>
     <el-form
        ref="formRef"
        :model="model"
        :rules="rules"
        :class="['word-form', `word-form--${layout}`]"
        @submit.prevent
    >
        <el-form-item prop="en">
            <el-input v-model="model.en" placeholder="英文" @keyup.enter="handleSubmit" />
        </el-form-item>
        <el-form-item prop="zh">
            <el-input v-model="model.zh" placeholder="中文" @keyup.enter="handleSubmit" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
                {{ submitText }}
            </el-button>
        </el-form-item>
    </el-form>
</template>
<style scoped>
.word-form--row {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
}
.word-form--row .el-form-item {
    flex: 1;
    margin-right: 0;
    margin-bottom: 0;
}
.word-form--row .el-form-item:last-child {
    flex: 0 0 auto;
}
.word-form--column {
    display: flex;
    flex-direction: column;
}
</style>