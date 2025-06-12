<script lang="ts">
  interface Props {
    label: string;
    error?: string;
    required?: boolean;
    helper?: string;
    id: string;
    name: string;
    type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password' | 'select' | 'textarea';
    value?: any;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
    onchange?: (e: Event) => void;
    oninput?: (e: Event) => void;
    children?: any;
    [key: string]: any;
  }
  
  let {
    label,
    error = '',
    required = false,
    helper = '',
    id,
    name,
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    readonly = false,
    class: className = '',
    onchange,
    oninput,
    children,
    ...rest
  }: Props = $props();
  
  const baseInputClasses = `
    mt-1 block w-full rounded-md border-gray-300 shadow-sm
    focus:border-green-500 focus:ring-green-500
    disabled:bg-gray-50 disabled:text-gray-500
  `;
  
  const errorClasses = `
    border-red-300 text-red-900 placeholder-red-300
    focus:border-red-500 focus:ring-red-500
  `;
  
  const inputClasses = $derived(`${baseInputClasses} ${error ? errorClasses : ''}`);
</script>

<div class={className}>
  <label for={id} class="block text-sm font-medium text-gray-700">
    {label}
    {#if required}
      <span class="text-red-500 ml-1">*</span>
    {/if}
  </label>
  
  {#if type === 'select'}
    <select
      {id}
      {name}
      bind:value
      {disabled}
      class={inputClasses}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
      {onchange}
      {...rest}
    >
      {#if children}
        {@render children()}
      {/if}
    </select>
  {:else if type === 'textarea'}
    <textarea
      {id}
      {name}
      bind:value
      {placeholder}
      {disabled}
      {readonly}
      class={inputClasses}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
      rows={3}
      {onchange}
      {oninput}
      {...rest}
    ></textarea>
  {:else}
    <input
      {id}
      {name}
      {type}
      bind:value
      {placeholder}
      {disabled}
      {readonly}
      class={inputClasses}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
      {onchange}
      {oninput}
      {...rest}
    />
  {/if}
  
  {#if error}
    <p class="mt-1 text-sm text-red-600" id={`${id}-error`}>
      {error}
    </p>
  {:else if helper}
    <p class="mt-1 text-sm text-gray-500" id={`${id}-helper`}>
      {helper}
    </p>
  {/if}
</div>