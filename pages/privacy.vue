<template>
  <div class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p class="text-sm text-gray-500">Last updated {{ lastUpdated }}</p>
        <p class="text-gray-600">
          We built Phrames with privacy at the core. This policy explains what we do—and don’t do—with your data.
        </p>
      </header>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">1. Visitor Photos Stay Local</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>Uploaded photos never leave the browser. We do not transmit or store visitor images on our servers.</li>
          <li>The composition happens entirely client-side; downloads are generated directly in the browser.</li>
          <li>No tracking pixels, ads, or third-party analytics are embedded on public campaign pages.</li>
        </ul>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">2. Creator Accounts & Campaign Data</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-600">
          <li>We store the email address you provide for authentication and transactional updates.</li>
          <li>Campaign frames are stored in our S3-compatible storage so they can be served to visitors.</li>
          <li>We collect lightweight metrics (visits, renders, downloads) to display to creators. These are aggregated and contain no personal identifiers.</li>
        </ul>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">3. Cookies</h2>
        <p class="text-gray-600">
          Creators receive a secure session cookie when they sign in. This cookie is only used to keep you logged in and is never shared with third parties.
        </p>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">4. Reporting & Safety</h2>
        <p class="text-gray-600">
          When a campaign is reported, we review the frame, associated metadata, and aggregated metrics. We may suspend the campaign or creator account if the report is validated.
        </p>
      </section>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">5. Contact</h2>
        <p class="text-gray-600">
          Need more detail? Reach the team at <a href="mailto:privacy@phrames.cleffon.com" class="text-blue-600 hover:underline">privacy@phrames.cleffon.com</a>.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = new Date('2024-06-01').toLocaleDateString()

useSeoMeta({
  title: 'Privacy Policy • Phrames',
  description: 'Learn how Phrames keeps visitor photos local and protects creator data.'
})
</script>
