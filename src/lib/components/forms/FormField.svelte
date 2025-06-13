<!-- src/lib/components/forms/FormField.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { sanitizeInput } from '$lib/utils/security';
  
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
    icon?: string;
    maxlength?: number;
    pattern?: string;
    autocomplete?: string;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    rows?: number;
    onchange?: (e: Event) => void;
    oninput?: (e: Event) => void;
    onblur?: (e: Event) => void;
    onfocus?: (e: Event) => void;
    onpaste?: (e: ClipboardEvent) => void;
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
    icon,
    maxlength,
    pattern,
    autocomplete,
    min,
    max,
    step,
    rows = 3,
    onchange,
    oninput,
    onblur,
    onfocus,
    onpaste,
    children,
    ...rest
  }: Props = $props();
  
  let focused = $state(false);
  let touched = $state(false);
  
  const baseInputClasses = `
    mt-1 block w-full rounded-lg border-2 shadow-sm
    transition-all duration-200 ease-in-out
    focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    placeholder-gray-400
  `;
  
  const normalClasses = `
    border-gray-300 focus:border-green-500 focus:ring-green-500
    hover:border-gray-400
  `;
  
  const errorClasses = `
    border-red-400 text-red-900 placeholder-red-300
    focus:border-red-500 focus:ring-red-500
  `;
  
  const iconPadding = icon ? 'pl-10' : '';
  
  const inputClasses = $derived(`
    ${baseInputClasses} 
    ${error && touched ? errorClasses : normalClasses}
    ${iconPadding}
    ${type === 'textarea' ? 'resize-y min-h-[100px]' : ''}
  `);
  
  // Security: Sanitize input on blur for text fields
  function handleBlur(e: Event) {
    touched = true;
    focused = false;
    
    if (type === 'text' || type === 'textarea') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      value = sanitizeInput(target.value);
    }
    
    if (onblur) onblur(e);
  }
  
  function handleFocus(e: Event) {
    focused = true;
    if (onfocus) onfocus(e);
  }
  
  // Prevent paste of malicious content
  function handlePaste(e: ClipboardEvent) {
    if (type === 'text' || type === 'textarea') {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      const sanitized = sanitizeInput(text);
      
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      
      value = value.substring(0, start) + sanitized + value.substring(end);
    }
    
    if (onpaste) onpaste(e);
  }
</script>

<div class={`form-field ${className}`}>
  <label 
    for={id} 
    class={`
      block text-sm font-medium mb-1 transition-colors
      ${focused ? 'text-green-700' : 'text-gray-700'}
      ${error && touched ? 'text-red-700' : ''}
    `}
  >
    {label}
    {#if required}
      <span class="text-red-500 ml-1" aria-label="required">*</span>
    {/if}
  </label>
  
  <div class="relative">
    {#if icon}
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {@html icon}
        </svg>
      </div>
    {/if}
    
    {#if type === 'select'}
      <select
        {id}
        {name}
        bind:value
        {disabled}
        class={inputClasses}
        aria-invalid={!!error && touched}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        aria-required={required}
        onfocus={handleFocus}
        onblur={handleBlur}
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
        {maxlength}
        {rows}
        class={inputClasses}
        aria-invalid={!!error && touched}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        aria-required={required}
        onfocus={handleFocus}
        onblur={handleBlur}
        onpaste={handlePaste}
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
        {maxlength}
        {pattern}
        {min}
        {max}
        {step}
        autocomplete={autocomplete || undefined}
        class={inputClasses}
        aria-invalid={!!error && touched}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        aria-required={required}
        onfocus={handleFocus}
        onblur={handleBlur}
        onpaste={handlePaste}
        {onchange}
        {oninput}
        {...rest}
      />
    {/if}
    
    {#if error && touched}
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    {/if}
  </div>
  
  {#if error && touched}
    <p class="mt-2 text-sm text-red-600 flex items-center" id={`${id}-error`} role="alert">
      <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      {error}
    </p>
  {:else if helper}
    <p class="mt-2 text-sm text-gray-500" id={`${id}-helper`}>
      {helper}
    </p>
  {/if}
  
  {#if maxlength && (type === 'text' || type === 'textarea')}
    <p class="mt-1 text-xs text-gray-400 text-right">
      {value.length} / {maxlength}
    </p>
  {/if}
</div>

<style>
  .form-field {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Better focus styles */
  :global(input:focus),
  :global(select:focus),
  :global(textarea:focus) {
    outline: none;
  }
</style>