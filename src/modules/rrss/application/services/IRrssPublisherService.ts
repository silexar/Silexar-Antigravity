import { RrssConnection } from '../../domain/entities/RrssConnection';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
}

export interface IRrssPublisherService {
  publish(connection: RrssConnection, publicacion: RrssPublicacion): Promise<PublishResult>;
}
