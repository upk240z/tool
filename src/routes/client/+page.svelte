<script lang="ts">
  import ResultBox from '$lib/components/ResultBox.svelte'

  export let data;
</script>

<h1>Client information</h1>

<section>
  <div class="grid grid-cols-3 gap-3">
    <ResultBox label="IP" text={data.ip}/>
  </div>
</section>
