<script lang="ts">
  import {onMount} from 'svelte'
  import {
    Fileupload, Spinner, Button, Badge, Alert, FloatingLabelInput, Modal, Dropzone
  } from 'flowbite-svelte'
  import {InfoCircleSolid, CloseOutline, CopySolid, PlusOutline, TrashBinOutline} from 'flowbite-svelte-icons'
  import {parseFile, saveDefinition, getDefinitions, deleteDefinition} from '$lib/fld'
  import type {ParseResult, ColumnInfo, FILE_DATA} from '$lib/fld'
  import {copyClip} from '$lib/utils'

  let parseResult: ParseResult | null = null

  let errors: string[] = []
  let filterText = ''
  let refTable: HTMLTableElement
  let spinnerVisible = false
  let open = false
  let definitions: FILE_DATA[] = []
  let openDefinitionModal = false
  let selectedDefinition: FILE_DATA = {type: '', json: '', length: 0}
  let inputFileType = ''
  let refDefineFile: FileList

  const prevent = (e: Event) => { e.preventDefault() }

  onMount(() => {
    definitions = getDefinitions()
  })

  const readFile = async (file: File) => {
    spinnerVisible = true
    errors = []
    try {
      parseResult = await parseFile(file)
      errors = parseResult.messages
    } catch (err) {
      parseResult = null
      errors = [err  + ': ' + file.name]
    } finally {
      spinnerVisible = false
    }
  }

  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      readFile(target.files[0])
    }
  }

  const onDrop = (e: DragEvent) => {
    prevent(e)
    if (!e.dataTransfer) { return }
    if (e.dataTransfer.items) {
      const file = e.dataTransfer.items[0].getAsFile()
      if (file) {
        readFile(file)
      }
    }
  }

  const onClickCopy = () => {
    if (!parseResult) { return }

    const delimiter = "\t"
    const headers = parseResult.columns.map((header: ColumnInfo, index: number) => {
      return (index + 1) + '.' + header.name
    })

    const lines = parseResult.rows.map((row: {[index: string]: string}) => {
      return parseResult!.columns.map((column: ColumnInfo) => {
        return row[column.name]
      }).join(delimiter)
    })

    lines.unshift(headers.join(delimiter))
    copyClip(lines.join("\n"))
  }

  $: if (refTable) {
    let hits: string[] = []
    if (filterText.length > 0) {
      const keywords = filterText.split(' ')

      refTable.querySelectorAll('th').forEach((el: HTMLElement) => {
        keywords.forEach(word => {
          if (word.length > 0 && el.textContent!.toUpperCase().indexOf(word.toUpperCase()) >= 0) {
            hits.push(el.getAttribute('data-no')!)
            return false
          }
        })
      })
    }

    refTable.querySelectorAll('th, td').forEach((el: Element) => {
      const no = el.getAttribute('data-no')
      if (!no) { return }
      const element = el as HTMLElement
      if (filterText.length > 0 && !hits.includes(no)) {
        element.style.display = 'none'
      } else {
        element.style.display = ''
      }
    })
  }

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    errors = []
    if (inputFileType.length > 0 && refDefineFile && refDefineFile.length > 0) {
      try {
        await saveDefinition(inputFileType, refDefineFile[0])
        definitions = getDefinitions()
      } catch (e: any) {
        errors = [e]
      } finally {
        inputFileType = ''
        open = false
      }
    }
  }

  const onClickDelete = (type: string) => {
    deleteDefinition(type)
    definitions = getDefinitions()
  }

  const onClickDefinition = (type: string) => {
    const filtered = definitions.filter((definition) => {
      return definition.type == type
    })
    if (filtered.length > 0) {
      selectedDefinition = filtered[0]
    }
    openDefinitionModal = true
  }
</script>

<h1>Fixed length data</h1>

<section>
  <h2 class="inline-flex items-center gap-2 font-medium">
    Data definition
    <Button size="sm" color="green" on:click={() => open = true}>
      <PlusOutline size="sm"/>
    </Button>
  </h2>

  {#if definitions.length > 0}
    <div class="mt-3 grid grid-cols-2 gap-2">
      {#each definitions as definition}
        <div class="border border-gray-400 rounded-lg p-3 inline-flex items-center gap-2">
          <Button on:click={() => {onClickDefinition(definition.type)}}
            size="xs" class="bg-green-300 border border-green-800 text-green-800 hover:text-white hover:bg-blue-600">
            {definition.type}
          </Button>
          <span class="ml-1 text-base grow">{definition.length} bytes</span>
          <Button color="red" size="sm"
                  on:click={() => {onClickDelete(definition.type)}}>
            <TrashBinOutline size="sm"/>
          </Button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section class="mt-5">
  <Dropzone
    on:drop={onDrop} on:change={onChange} on:dragover={prevent}
    class="h-28">
    <svg aria-hidden="true" class="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
  </Dropzone>

  {#if spinnerVisible}
    <Spinner color="green" class="mt-5"/>
  {/if}

  {#if errors.length > 0}
    <div class="flex flex-col gap-2 mt-5">
      {#each errors as error}
        <Alert>
          <InfoCircleSolid slot="icon" class="w-4 h-4" />
          {error}
        </Alert>
      {/each}
    </div>
  {/if}

  {#if parseResult}
    <div class="mt-5 flex items-center gap-3">
      <Badge border color="green" class="text-base">種別</Badge>
      <span>{parseResult.type}</span>
      <Badge border color="indigo" class="text-base">データ長</Badge>
      <span>{parseResult.dataLength}</span>
    </div>

    <div class="mt-3 flex gap-3">
      <div class="w-full">
        <FloatingLabelInput style="outlined" bind:value={filterText}>Keyword</FloatingLabelInput>
      </div>
      <Button color="blue" on:click={onClickCopy}>
        <CopySolid size="sm"/>
      </Button>
      <Button color="green" on:click={() => filterText = ''}>
        <CloseOutline size="sm"/>
      </Button>
    </div>

    <div class="overflow-x-auto mt-5">
      <table bind:this={refTable}>
        <thead>
        <tr>
          <th>行番号</th>
          <th>データ長</th>
          {#each parseResult.columns as column, no}
            <th data-no="{no + 1}">
              {no + 1}.{column.name}<br>
              {column.start}:{column.length}
            </th>
          {/each}
        </tr>
        </thead>
        <tbody>
        {#each parseResult.rows as row, rowNo}
          <tr class="{parseResult.dataLength !== parseResult.lineLengths[rowNo] ? 'bg-red-300' : ''}">
            <td>{rowNo + 1}</td>
            <td>{parseResult.lineLengths[rowNo]}</td>
            {#each parseResult.columns as column, no}
              <td data-no="{no + 1}">{row[column.name].replace(/　+$/g, function (v) {
                return '□'.repeat(v.length)
              })}</td>
            {/each}
          </tr>
        {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<form action="" on:submit={onSubmit}>
  <Modal bind:open>
    <div class="flex flex-col gap-3">
      <div class="flex gap-3 items-center mt-3">
        <FloatingLabelInput style="outlined" size="small" bind:value={inputFileType}>File type</FloatingLabelInput>
        <Fileupload bind:files={refDefineFile}/>
      </div>
      <Button type="submit">Add definition</Button>
    </div>
  </Modal>
</form>

<Modal outsideclose
  bind:open={openDefinitionModal} title={selectedDefinition.type}>
  <div class="relative">
    <pre class="border rounded-lg bg-green-100 p-3">{selectedDefinition.json}</pre>
    <Button on:click={() => copyClip(selectedDefinition.json)}
      size="sm" class="absolute top-[-0.5rem] right-[-0.5rem]">
      <CopySolid size="sm"/>
    </Button>
  </div>
</Modal>

<style lang="postcss">
  table {
    td, th {
      border: 1px gray solid;
      padding: 3px;
      font-weight: normal;
      white-space:nowrap;
      @apply text-sm;
      height: 30px;
    }
  }
</style>
