import { AlertCircle, Plug, RotateCcw } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Switch } from '../../ui/switch';
import { SectionHeader } from '../shared-ui';
import type {
  StorefrontIntegrationConfig,
  StorefrontIntegrationField,
  StorefrontIntegrationReadyConfig,
  StorefrontIntegrationValue,
} from '../storefront-integration';

interface StorefrontIntegrationPanelProps {
  config: StorefrontIntegrationConfig;
}

function valueAsString(value: StorefrontIntegrationValue | undefined): string {
  return typeof value === 'string' ? value : '';
}

function valueAsBoolean(value: StorefrontIntegrationValue | undefined): boolean {
  return typeof value === 'boolean' ? value : false;
}

function IntegrationField({
  field,
  config,
}: {
  field: StorefrontIntegrationField;
  config: StorefrontIntegrationReadyConfig;
}) {
  const inputId = `ov25-setup-integration-${field.key}`;
  const value = config.values[field.key];

  if (field.type === 'switch') {
    return (
      <div className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-border bg-background p-2.5">
        <div className="min-w-0 flex-1">
          <Label htmlFor={inputId} className="text-xs font-medium text-foreground">
            {field.label}
          </Label>
          {field.description && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
        <Switch
          id={inputId}
          checked={valueAsBoolean(value)}
          disabled={config.readOnly}
          onCheckedChange={(checked) => config.onChange(field.key, checked)}
          aria-label={field.label}
          className="mt-0.5 shrink-0"
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-1.5 rounded-lg border border-border bg-background p-2.5">
      <div>
        <Label htmlFor={inputId} className="text-xs font-medium text-foreground">
          {field.label}
        </Label>
        {field.description && (
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            {field.description}
          </p>
        )}
      </div>
      {field.type === 'select' ? (
        <Select
          value={valueAsString(value)}
          disabled={config.readOnly}
          onValueChange={(nextValue) => config.onChange(field.key, nextValue)}
        >
          <SelectTrigger id={inputId} aria-label={field.label} className="h-8 w-full text-xs">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={inputId}
          type="text"
          value={valueAsString(value)}
          disabled={config.readOnly}
          placeholder={field.placeholder}
          onChange={(event) => config.onChange(field.key, event.target.value)}
          aria-label={field.label}
          className={`h-8 min-w-0 text-xs ${field.type === 'selector' ? 'font-mono text-[11px]' : ''}`}
        />
      )}
    </div>
  );
}

function ReadyIntegrationPanel({ config }: { config: StorefrontIntegrationReadyConfig }) {
  return (
    <div className="min-w-0 max-w-full space-y-3 py-3 pr-4">
      <section className="min-w-0 rounded-xl border border-border bg-background p-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
            <Plug className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">{config.platformLabel}</h2>
            {config.scopeLabel && (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground" title={config.scopeLabel}>
                {config.scopeLabel}
              </p>
            )}
          </div>
        </div>
        {config.notice && (
          <p className="mt-3 rounded-lg bg-muted/60 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
            {config.notice}
          </p>
        )}
        {config.readOnly && (
          <p
            className="mt-3 rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-[10px] font-medium text-muted-foreground"
            role="status"
          >
            These integration settings are read-only.
          </p>
        )}
      </section>

      <fieldset disabled={config.readOnly} className="m-0 min-w-0 space-y-3 border-0 p-0">
        {config.sections.map((section) => (
          <section
            key={section.id}
            className="min-w-0 rounded-xl border border-border bg-muted/20 p-3.5"
            data-ov25-setup-integration-section={section.id}
          >
            <SectionHeader description={section.description}>{section.title}</SectionHeader>
            <div className="mt-3 min-w-0 space-y-2.5">
              {section.fields.map((field) => (
                <IntegrationField key={field.key} field={field} config={config} />
              ))}
            </div>
          </section>
        ))}
      </fieldset>
      <div className="h-4" />
    </div>
  );
}

export function StorefrontIntegrationPanel({ config }: StorefrontIntegrationPanelProps) {
  return (
    <ScrollArea className="h-full min-h-0 min-w-0" data-ov25-setup-integration-panel>
      {config.status === 'loading' && (
        <div className="py-8 pr-4 text-center" role="status" aria-busy="true">
          <Plug className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium text-foreground">
            {config.platformLabel ? `Loading ${config.platformLabel}` : 'Loading integration settings'}
          </p>
          {config.message && (
            <p className="mt-1 text-[10px] text-muted-foreground">{config.message}</p>
          )}
        </div>
      )}

      {config.status === 'error' && (
        <div className="py-8 pr-4 text-center" role="alert">
          <AlertCircle className="mx-auto h-5 w-5 text-destructive" />
          <p className="mt-2 text-xs font-semibold text-foreground">
            {config.platformLabel ? `${config.platformLabel} could not be loaded` : 'Integration settings could not be loaded'}
          </p>
          <p className="mx-auto mt-1 max-w-[16rem] text-[10px] leading-relaxed text-muted-foreground">
            {config.message}
          </p>
          {config.onRetry && (
            <button
              type="button"
              onClick={config.onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {config.status === 'ready' && <ReadyIntegrationPanel config={config} />}
    </ScrollArea>
  );
}
