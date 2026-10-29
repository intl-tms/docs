<script setup lang="ts">
import {withBase} from 'vitepress';
</script>

<template>
  <div class="status-banner" role="note">
    <strong>Under development.</strong>
    <span class="status-banner-long">The API can change.</span>
    <span>Not for production.</span>
    <a :href="withBase('/developers/security#not-ready-for-production')">Read why</a>
  </div>
</template>
