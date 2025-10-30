<template>
  <section class="bg-white py-16 lg:py-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-display-md text-dark-900 mb-4">
          Featured Campaigns
        </h2>
        <p class="text-lg text-gray-600">
          See what others are creating with Phrames
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Campaign Card 1 -->
        <CampaignCard
          title="Save the Ocean"
          description="Join our movement to protect marine life"
          image="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
          slug="save-the-ocean"
          stats="1.2k downloads"
        />

        <!-- Campaign Card 2 -->
        <CampaignCard
          title="Climate Action Now"
          description="Show your support for climate action"
          image="https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=300&fit=crop"
          slug="climate-action"
          stats="856 downloads"
        />

        <!-- Campaign Card 3 -->
        <CampaignCard
          title="Support Local Artists"
          description="Celebrate creativity in your community"
          image="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop"
          slug="support-artists"
          stats="643 downloads"
        />
      </div>

      <div class="text-center mt-12">
        <NuxtLink to="/campaigns" class="btn-secondary">
          View All Campaigns
        </NuxtLink>
      </div>
    </div>
  </section>
</template>