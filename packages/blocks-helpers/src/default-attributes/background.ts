import { BlockSupports } from "..";

export type BackgroundAttribute<Supports extends BlockSupports> = {
	style?: Supports extends {
		background: {
			backgroundImage: true;
			backgroundSize: true;
		};
	}
		? {
				background?: {
					backgroundImage?: {
						url: string;
						id: number;
						source: string;
						title: string;
					};
					backgroundPosition?: string;
				};
			}
		: Supports extends {
					background: {
						backgroundImage: true;
						backgroundSize: false;
					};
			  }
			? {
					background?: {
						backgroundImage?: {
							url: string;
							id: number;
							source: string;
							title: string;
						};
					};
				}
			: Supports extends {
						background: {
							backgroundImage: false;
							backgroundSize: true;
						};
				  }
				? {
						background?: {
							backgroundPosition?: string;
						};
					}
				: never;
};
