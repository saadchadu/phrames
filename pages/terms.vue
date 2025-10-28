<template>
  <div class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold text-gray-900">Terms of Use</h1>
        <p class="text-sm text-gray-500">Last updated {{ lastUpdated }}</p>
        <p class="text-gray-600">
          These Terms govern your use of Phrames. By creating an account or visiting a public campaign page, you agree to the rules below.
        </p>
      </header>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">1. Service Overview</h2>
        <p class="text-gray-600">
          Phrames lets creators upload PNG frames with transparency and share a link where visitors can compose and download images for free. We do not sell or license visitor photos and we keep the product free of watermarks, ads, and paywalls.
        </p>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">2. Creator Responsibilities</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>You must own the rights to any frames you upload or have permission to use them.</li>
          <li>You may not upload frames that contain hateful, abusive, pornographic, or otherwise unlawful content.</li>
          <li>You must respect visitor privacy and refrain from attempting to collect their photos or personal data.</li>
          <li>We reserve the right to suspend campaigns or accounts that violate these terms or draw credible reports from the community.</li>
        </ul>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">3. Visitor Responsibilities</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>You retain all rights to the photos you upload and the composites you download.</li>
          <li>Do not attempt to interfere with or reverse engineer the service.</li>
          <li>Report campaigns that appear abusive, infringing, or unsafe using the in-product report form.</li>
        </ul>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">4. Disclaimers</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>Phrames is provided “as is” with no warranty of uninterrupted service.</li>
          <li>We are not liable for any loss arising from the use or inability to use the service.</li>
          <li>We may update these Terms from time to time. Continued use of the product means you accept the changes.</li>
        </ul>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">5. Contact</h2>
        <p class="text-gray-600">
          Questions about these Terms? Reach us at <a href="mailto:support@phrames.cleffon.com" class="text-blue-600 hover:underline">support@phrames.cleffon.com</a>.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = new Date('2024-06-01').toLocaleDateString()

useSeoMeta({
  title: 'Terms of Use • Phrames',
  description: 'Review the Terms of Use for Phrames, the free frame composer for creators and visitors.'
})
</script>
