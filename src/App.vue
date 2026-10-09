<template>
    <div class="page">
        <div class="nav-row">
        <RouterLink to="/">单词本</RouterLink>
        <RouterLink to="/quiz">单词测验</RouterLink>
        </div>
        <RouterView></RouterView>
    </div>
</template>
<style scoped>
.nav-row {
    display:flex;
    gap:var(--space-sm);
    margin-bottom:var(--space-lg);
}
.nav-row a {
    text-decoration:none;
    color:var(--color-text-muted);
    display:inline-block;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
}
.nav-row a:hover {
    background:#f5f5f5;
}
.nav-row a:focus-visible {
    outline:none;
    border-color:var(--color-primary);
    box-shadow:0 0 0 3px var(--color-primary-soft);      
}
.nav-row a.router-link-active {
    background:var(--color-primary);
    border-color:var(--color-primary);
    color:#fff;
}
</style>