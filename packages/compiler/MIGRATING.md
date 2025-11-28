# Migration guides

This document contains information on how to migrate from one version to the next version.

## v2 --> v3

### Updated peer deps

The package now requires v10 of the @atomicsmash/cli package.

## v1 --> v2

### Added content hash to svg sprite filename for cache busting.

The SVG sprite file name now contains a fingerprint so it's unique and can be easily cached for a long time, but this means you need to load your SVG sprite using the manifest the same way you do for JS / CSS files.

In JS this is a little trickier, as if you import the manifest, it makes an infinite dependency loop, so you can import the sprite in JSX like so:

```tsx
const ManifestedIcon = lazy(async () => {
	const assetManifest = await import(
		// @ts-expect-error -- This works on the browser and isn't run in the bundler.
		/* webpackIgnore: true */ "/path/to/assets-manifest.json",
		// @ts-expect-error -- This works on the browser and isn't run in the bundler.
		{ with: { type: "json" } }
	)
		.then((module: { default: Record<string, unknown> }) => {
			if (
				!module.default["icons/sprite.svg"] ||
				typeof module.default["icons/sprite.svg"] !== "string"
			) {
				throw new Error("Icon sprite missing from manifest.");
			}
			return module.default as Record<string, string>;
		})
		.catch(() => ({}) as Record<string, never>);
	return {
		default: function ManifestedIcon(props: IconProps) {
			const { iconName, size, isEditorMode = false, ...svgProps } = props;
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size}
					height={size}
					{...svgProps}
				>
					{/* Full URL is required to make SVGs load in iframed block editor. */}
					<use
						href={`${isEditorMode ? `${window.location.protocol}//${window.location.host}` : ""}/path/to/asset/folder/${assetManifest["icons/sprite.svg"]}#${iconName}`}
					/>
				</svg>
			);
		},
	};
});

export function Icon(props: IconProps) {
	return (
		<Suspense fallback={null}>
			<ManifestedIcon {...props} />
		</Suspense>
	);
}
```

In PHP it's easier, but here's an example for reference:

```php
/**
 * Icon function
 *
 * This function generates an SVG from an icon name and allows custom attributes to be passed in
 *
 * @param string                    $icon_name Icon name.
 * @param array<string,string|bool> $attributes The HTML attributes to add to the SVG element.
 */
function icon( string $icon_name, array $attributes = array() ): string {
	$assets = new Assets(); // This is the assets class created from the helper in atomicsmash/compiler-helpers composer package.
	$icon_sprite = $assets->get_cached_asset( 'icons/sprite.svg' );
	$attrs = join(
		' ',
		array_map(
			function ( $key ) use ( $attributes ) {
				if ( is_bool( $attributes[ $key ] ) ) {
					return $attributes[ $key ] ? $key : '';
				}
				return $key . '="' . $attributes[ $key ] . '"';
			},
			array_keys( $attributes )
		)
	);

	$result = '<svg xmlns="http://www.w3.org/2000/svg" ' . $attrs . '><use href="' . $icon_sprite['source'] . '#' . $icon_name . '"></use></svg>';
	return $result;
}
```
