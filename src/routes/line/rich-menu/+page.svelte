<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import {
    Button, FloatingLabelInput, Modal, Spinner, Dropzone, Textarea, ButtonGroup, Input
  } from 'flowbite-svelte'
  import {
    TrashBinOutline, CheckSolid, EyeOutline, PlusOutline, UploadOutline, CopySolid, ArrowUpOutline
  } from 'flowbite-svelte-icons'
  import {PUBLIC_NETLIFY_FUNCTION_BASE} from '$env/static/public'
  import {getItem, setItem, loading} from '$lib/store'
  import {copyClip} from '$lib/utils'

  type ObjectData = {[i: string]: any}

  let token = ''
  let promise: Promise<void>
  let menus: ObjectData[] = []
  let defaultId = ''
  let open = false
  let modalTitle = ''
  let modalBody = ''
  let modalImageUri = ''
  let isOpenForm = false
  let uploadFile = {
    type: '',
    base64: '',
  }
  let json = ''

  const init = () => {
    if (token.length == 0) {
      return
    }

    promise = getMenus()
    getDefaultId()
  }

  const headers = () => {
    return {
      'Content-Type': 'application/json',
      'line-token': token,
    }
  }

  const getMenus = async (): Promise<void> => {
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/richmenus`

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: headers(),
    })

    if (response.ok) {
      menus = await response.json() as object[]
    } else {
      console.log(response.statusText)
    }
  }

  const getDefaultId = async () => {
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/default-richmenu-id`

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: headers(),
    })

    if (response.ok) {
      const result = await response.json() as ObjectData
      defaultId = result.richMenuId
    } else {
      console.log(response.statusText)
    }
  }

  const getImage = async (menuId: string) => {
    modalImageUri = ''
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/richmenu-image/${menuId}`
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: headers(),
    })

    if (response.ok) {
      const blob = await response.blob()
      modalImageUri = window.URL.createObjectURL(blob)
    } else {
      console.log(response.statusText)
    }
  }

  onMount(() => {
    token = getItem('line-token', '')
    init()
  })

  onDestroy(() => {
    if (token.length > 0) {
      setItem('line-token', token)
    }
  })

  const openModal = async (menu: {[i: string]: any}) => {
    modalTitle = menu.name
    modalBody = JSON.stringify(menu, null, 2)
    getImage(menu.richMenuId)
    open = true
  }

  const prevent = (e: Event) => { e.preventDefault() }

  const openForm = () => {
    uploadFile = {type: '', base64: ''}
    isOpenForm = true
  }

  const onSubmit = async (e: Event) => {
    loading.set(true)
    prevent(e)
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/richmenu`

    const parameters = {
      image: uploadFile,
      json,
    }

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: headers(),
      body: JSON.stringify(parameters)
    })

    if (!response.ok) {
      console.log(response.statusText)
    }

    loading.set(false)
    isOpenForm = false
    promise = getMenus()
  }

  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      readFile(target.files[0])
    }
  }

  const onDrop = (e: DragEvent) => {
    prevent(e)
    if (e.dataTransfer && e.dataTransfer.items) {
      const file = e.dataTransfer.items[0].getAsFile()
      if (file) {
        readFile(file)
      }
    }
  }

  const readFile = (file: File): Promise<void> => {
    uploadFile.type = file.type
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        uploadFile.base64 = btoa(reader.result as string)
        resolve()
      }

      reader.onerror = (err) => {
        reject(err)
      }

      reader.readAsBinaryString(file)
    })
  }

  const setDefault = async (menuId: string) => {
    loading.set(true)
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/richmenu-default/${menuId}`
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: headers(),
    })
    loading.set(false)

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    defaultId = menuId
    promise = getMenus()
  }

  const deleteMenu = async (menuId: string) => {
    loading.set(true)
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/richmenu/${menuId}`
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      headers: headers(),
    })
    loading.set(false)

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    promise = getMenus()
  }

  const updateAlias = async (menu: {[i: string]: any}) => {
    loading.set(true)
    const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/alias/${menu.alias}`

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: headers(),
      body: JSON.stringify({richMenuId: menu.richMenuId})
    })

    loading.set(false)

    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    promise = getMenus()
  }
</script>

<h1>LINE rich menu</h1>

<section>
  <div class="flex gap-3">
    <div class="w-full">
      <FloatingLabelInput style="outlined" bind:value={token} on:change={init}>Access token</FloatingLabelInput>
    </div>
  </div>
</section>

<section class="mt-5">
  {#await promise}
    <div class="p-5 text-center"><Spinner color="blue"/></div>
  {:then _}
    <div class="menus">
      {#each menus as menu}
        <Button color="blue" size="sm" class="py-2 text-base" on:click={() => copyClip(menu.richMenuId)}>
          {menu.richMenuId}
        </Button>
        <span class="border border-gray-400 p-2 rounded-lg" class:default={menu.richMenuId === defaultId}>
          {menu.name}
        </span>
        <Input bind:value={menu.alias}>
          <Button slot="right" size="sm" color="blue" on:click={() => { updateAlias(menu) }}>
            <ArrowUpOutline size="sm"/>
          </Button>
        </Input>
        <ButtonGroup>
          <Button class="py-3" color="yellow" on:click={() => { openModal(menu) }}>
            <EyeOutline/>
          </Button>
          <Button class="py-3" color="green" on:click={() => {setDefault(menu.richMenuId)}}>
            <CheckSolid/>
          </Button>
          <Button class="py-3" color="red" on:click={() => {deleteMenu(menu.richMenuId)}}>
            <TrashBinOutline/>
          </Button>
        </ButtonGroup>
      {/each}
    </div>
  {/await}
</section>

<Modal title={modalTitle} bind:open outsideclose>
  <div class="flex flex-col gap-3 items-center">
    {#if modalImageUri.length > 0}
      <img src={modalImageUri} alt="">
    {:else}
      <Spinner color="blue"/>
    {/if}
    <div class="relative w-full">
      <pre class="border px-3 py-2 rounded-lg bg-blue-50 grow text-sm">{@html modalBody}</pre>
      <Button on:click={() => copyClip(modalBody)}
        size="sm" color="green" class="absolute top-0 right-0">
        <CopySolid size="sm"/>
      </Button>
    </div>
  </div>
</Modal>

<form method="post" on:submit={onSubmit}>
  <Modal title="new rich menu" bind:open={isOpenForm}>
    <div class="flex flex-col gap-3">
      {#if uploadFile.base64.length === 0}
        <Dropzone
          id="dropzone"
          on:drop={onDrop} on:change={onChange} on:dragover={prevent}
          class="h-28">
          <svg aria-hidden="true" class="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </Dropzone>
      {/if}
      {#if uploadFile.base64.length > 0}
        <img src={`data:${uploadFile.type};base64,${uploadFile.base64}`} alt="">
      {/if}
      <Textarea placeHolder="JSON" rows="10" bind:value={json}/>
      <Button type="submit" color="blue">
        <UploadOutline/>
      </Button>
    </div>
  </Modal>
</form>

<div class="fixed right-10 bottom-10 flex flex-col gap-2">
  <Button pill={true} class="!p-3" on:click={() => openForm()}>
    <PlusOutline size="lg"/>
  </Button>
</div>

<style lang="postcss">
  .menus {
    @apply grid grid-cols-4 gap-3 items-center;
    grid-template-columns: auto 3fr 1fr auto;
  }

  .default {
    @apply border-blue-800 bg-green-100;
  }
</style>
