<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import {
    Button, FloatingLabelInput, Modal, Spinner, Dropzone, Textarea, ButtonGroup, Input
  } from 'flowbite-svelte'
  import {
    TrashBinOutline, EyeOutline, PlusOutline, UploadOutline, FileCopyOutline, ArrowUpOutline,
    AnnotationOutline, RefreshOutline, CheckOutline
  } from 'flowbite-svelte-icons'
  import {PUBLIC_NETLIFY_FUNCTION_BASE} from '$env/static/public'
  import {getItem, setItem, loading} from '$lib/store'
  import {copyClip, setMessage, prevent} from '$lib/utils'

  type ObjectData = {[i: string]: any}

  let token = ''
  let promise: Promise<void>
  let menus: ObjectData[] = []
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
  let isOpenJson = false

  const richMenuIdList: {[i: string]: string} = {}
  let partOfRichMenuJson = ''

  const init = () => {
    if (token.length == 0) {
      return
    }

    promise = getMenus()
  }

  const headers = () => {
    return {
      'Content-Type': 'application/json',
      'line-token': token,
    }
  }

  const fetchJSON = async (method: 'GET' | 'POST' | 'DELETE', func: string, parameters: {[i: string]: any} = {}) => {
    try {
      const url = `${PUBLIC_NETLIFY_FUNCTION_BASE}/.netlify/functions/${func}`
      const option: {[i: string]: any} = {
        method,
        mode: 'cors',
        headers: headers(),
      }
      if (method == 'POST') {
        option.body = JSON.stringify(parameters)
      }
      const response = await fetch(url, option)

      if (response.ok) {
        return await response.json()
      } else {
        const errorJson = await response.json()
        setMessage(errorJson.message ? errorJson.message : response.statusText)
      }
    } catch (err: any) {
      setMessage(err.toString())
    }

    return null
  }

  const getMenus = async (): Promise<void> => {
    const result = await fetchJSON('GET', 'richmenus')
    if (result) {
      menus = result as any[]
      menus.forEach(menu => {
        if (menu.alias) {
          richMenuIdList[menu.alias] = menu.richMenuId
        }
      })
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
    open = true
    await getImage(menu.richMenuId)
  }

  const openJson = () => {
    partOfRichMenuJson = '"richMenus": ' + JSON.stringify(richMenuIdList, null, 2)
    isOpenJson = true
  }

  const openForm = () => {
    uploadFile = {type: '', base64: ''}
    isOpenForm = true
  }

  const onSubmit = async (e: Event) => {
    loading.set(true)
    prevent(e)
    const parameters = {
      image: uploadFile,
      json,
    }
    const result = await fetchJSON('POST', 'richmenu', parameters)
    if (result) {
      setMessage('created')
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
    const result = await fetchJSON('POST', `richmenu-default/${menuId}`)
    if (result) {
      setMessage('set default')
    }
    loading.set(false)
    promise = getMenus()
  }

  const deleteMenu = async (menuId: string) => {
    loading.set(true)
    const result = await fetchJSON('DELETE', `richmenu/${menuId}`)
    if (result) {
      setMessage('deleted')
    }
    loading.set(false)
    promise = getMenus()
  }

  const updateAlias = async (menu: {[i: string]: any}) => {
    loading.set(true)
    const result = await fetchJSON('POST', `alias/${menu.alias}`, {richMenuId: menu.richMenuId})
    if (result) {
      setMessage('alias updated')
    }
    loading.set(false)
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
    <div class="p-5 text-center"><Spinner color="blue" size={20}/></div>
  {:then _}
    <div class="menus">
      {#each menus as menu}
        <Button color="blue" size="sm" class="py-2 text-base" on:click={() => copyClip(menu.richMenuId)}>
          {menu.richMenuId}
        </Button>
        <span class="border border-gray-400 p-2 rounded-lg" class:default={menu.isDefault}>
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
            <CheckOutline/>
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
      <Spinner color="blue" size={12}/>
    {/if}
    <div class="relative w-full">
      <pre class="border px-3 py-2 rounded-lg bg-blue-50 grow text-sm">{@html modalBody}</pre>
      <Button on:click={() => copyClip(modalBody)}
        size="sm" color="green" class="absolute top-0 right-0">
        <FileCopyOutline size="sm"/>
      </Button>
    </div>
  </div>
</Modal>

<Modal title="Part of RichMenus JSON" bind:open={isOpenJson} outsideclose>
  <div class="relative">
    <pre class="p-3 rounded-lg bg-green-100">{partOfRichMenuJson}</pre>
    <Button on:click={() => copyClip(partOfRichMenuJson)}
            size="sm" color="green" class="absolute top-0 right-0">
      <FileCopyOutline size="sm"/>
    </Button>
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

<div class="fixed right-4 bottom-10 flex flex-col gap-2">
  <Button pill={true} color="yellow" class="!p-3" on:click={() => init()}>
    <RefreshOutline size="lg"/>
  </Button>
  <Button pill={true} color="green" class="!p-3" on:click={() => openJson()}>
    <AnnotationOutline size="lg"/>
  </Button>
  <Button pill={true} class="!p-3" on:click={() => openForm()}>
    <PlusOutline size="lg"/>
  </Button>
</div>

<style lang="postcss">
  .menus {
    @apply grid grid-cols-4 gap-3 items-center pr-10;
    grid-template-columns: auto 3fr 1fr auto;
  }

  .default {
    @apply border-blue-800 bg-green-100;
  }
</style>
