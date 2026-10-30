---
layout: page
title: "Thank you"
heading: "--- *Thank you*"
permalink: /thank-you/
description: "Thanks for buying a Slow Scotland itinerary."
# Where Payhip sends people after they buy an itinerary
# (Payhip: Account > Settings > Advanced Settings > Checkout Settings).
# Each product's redirect names its itinerary file, e.g.
# https://slowscotland.uk/thank-you/?itinerary=off-the-nc500
# so the first line names what they bought (assets/js/app.js).
noindex: true
signoff: Mat
button:
  url: /itineraries/
  text: "Back to itineraries"
---

Thanks for buying an itinerary.
{: data-itinerary-thanks="Thanks for buying the" data-itinerary-thanks-end="itinerary."}

Your receipt and download link are on their way to your email. The link takes you to your download page, where you can save both documents: a digital version and a print version.

If nothing arrives in the next few minutes, check your spam or promotions folder for an email from Payhip.

{% comment %} Each itinerary's name is its page heading without the rule and italics, e.g. "Off the NC500" {% endcomment %}
<script type="application/json" id="itinerary-titles">
{ {% for itinerary in site.itineraries %}{% if itinerary.heading.first == nil %}{% assign name = itinerary.heading %}{% else %}{% assign name = itinerary.heading | join: " " %}{% endif %}{% assign name = name | remove: "---" | remove: "*" | split: " " | join: " " %}{{ itinerary.slug | jsonify }}: {{ name | jsonify }}{% unless forloop.last %}, {% endunless %}{% endfor %} }
</script>
