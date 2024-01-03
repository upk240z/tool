<script lang="ts">
  import {onMount} from 'svelte'
  import {
    Fileupload, Label, Spinner, Button, Badge, Alert, FloatingLabelInput, Modal
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
  let inputFileType = ''
  let refDefineFile: FileList

  onMount(() => {
    definitions = getDefinitions()
  })

  const onFileChange = async (e: Event) => {
    spinnerVisible = true
    errors = []
    const target = e.target as HTMLInputElement
    if (!target.files || target.files?.length == 0) {
      spinnerVisible = false
      return
    }
    const file = target.files![0] as File

    try {
      parseResult = await parseFile(file)
      errors = parseResult.messages
    } catch (err) {
      parseResult = null
      errors = [err  + ': ' + target.files![0].name]
      target.value = ''
    } finally {
      spinnerVisible = false
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
          <Button color="red" size="sm" on:click={() => {onClickDelete(definition.type)}}>
            <TrashBinOutline size="sm"/>
          </Button>
          <Badge border color="green" class="text-base">{definition.type}</Badge>
          <span class="ml-1 text-base">{definition.length} bytes</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section class="mt-5">
  <Label>
    Fixed length data file
    <Fileupload class="mt-2" on:change={onFileChange}/>
  </Label>

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
