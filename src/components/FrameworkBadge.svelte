<script lang="ts">
  const { name, class: className }: { name: string; class?: string } = $props();
</script>

<img
  src={`/frameworks/${name.replaceAll(" ", "")}.svg`}
  alt={`${name} icon`}
  class={className}
  aria-label={`Badge ${name}`}
/>
