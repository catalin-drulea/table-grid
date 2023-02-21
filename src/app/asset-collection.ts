
/**
 * Wrapper for a list of IAssetGridModel which allows updating the assets, their alarm status and
 * their utilization status.
 */
export class AssetGridCollection {

    provider: Map<string, any> = new Map<string, any>();

    constructor() {

    }

    /**
     * Returns all asset grid models.
     */
    get(): any[] {
        return [ ...this.provider.values() ];
    }

    /**
     * Updates the assets stored in the collection by the following rule:
     *  If the asset is present in the collection, but not in the array passed as an argument,
     *    then the asset is removed from the collection.
     *  If the asset is present both in the collection and in the array passed as an argument,
     *    then the asset from the collection is updated.
     *  If the asset is present in the array passed as an argument but not in the collection,
     *    then the asset will be inserted in the collection.
     * @param assets The list of assets to be stored in the collection.
     */
    keep(assets: any[]): void {
        if (!assets) {
            return;
        }
        this.removeStale(assets);
        this.upsert(assets);
    }

    /**
     * Updates the alarm statuses of the assets which match the ids with the corresponding values.
     * @param update The ids of the assets to be updated and the updated alarm status values.
     */
    syncAlarmStatuses(update: IAlarmStatusUpdate[]): void {
        if (!update) {
            return;
        }
        update.forEach(u => {
            if (this.provider.has(u.assetId)) {
                const base = this.provider.get(u.assetId);
                base.assetAlarm = u.alarm;
                if (u.lastUpdatedTimestamp > new Date(base.lastUpdatedTimestamp)) {
                    base.lastUpdatedTimestamp = u.lastUpdatedTimestamp.toISOString();
                }
                this.provider.set(u.assetId, base);
            }
        })
    }

    /**
     * Updates the utilization statuses of the assets which match the ids with the corresponding values.
     * @param update The ids of the assets to be updated and the updated utilization status values.
     */
    syncUtilizationStatuses(update: IStatusUpdate[]): void {
        if (!update) {
            return;
        }
        update.forEach(u => {
            if (this.provider.has(u.assetId)) {
                const base = this.provider.get(u.assetId);
                base.status = u.status;
                if (new Date(u.lastUpdatedTimestamp) > new Date(base.lastUpdatedTimestamp)) {
                    base.lastUpdatedTimestamp = u.lastUpdatedTimestamp;
                }
                this.provider.set(u.assetId, base);
            }
        })
    }

    private removeStale(assets: any[]): void {
        const assetIdsInProvider = [ ...this.provider.keys() ];
        const assetIdsToKeep = assets.map(a => a.id);

        assetIdsInProvider.forEach(id => {
            if (!assetIdsToKeep.includes(id)) {
                this.provider.delete(id);
            }
        });
    }

    private upsert(assets: any[]): void {
        assets.forEach(a => {
            if (this.provider.has(a.id)) {
                this.patchWithAsset(a);
            } else {
                const gridModel = this.mapAssetToGridModel(a);
                this.provider.set(a.id, gridModel);
            }
        });
    }

    private patchWithAsset(update: any): void {
        const base = this.provider.get(update.id);

        const patched = this.mapAssetToGridModel(update);
        patched.status = base.status;
        patched.assetAlarm = base.assetAlarm;
        patched.jobStatus = base.jobStatus;
        patched.utilizationStatus = base.utilizationStatus;

        this.provider.set(patched.id, patched);
    }

    private mapAssetToGridModel(asset: any): any {
        return {
            id: asset.id,
            systemName: asset.location.systemName,
            name: asset.name,
            assetParent: asset.location.parent,
            workspace: asset.workspace,
            serialNumber: asset.serialNumber,
            modelName: asset.modelName,
            vendorName: asset.vendorName,
            firmwareVersion: asset.firmwareVersion,
            hardwareVersion: asset.hardwareVersion,
            busType: this.formatBusType(asset.busType),
            visaResourceName: asset.visaResourceName,
            resourceUri: asset.location.resourceUri,
            slotNumber: this.formatSlotNumber(asset.location.slotNumber),
            currentTemperature: this.formatTemperature(asset.temperatureSensors[0]?.reading),
            supportsCalibration: this.formatBoolean(asset.supportsSelfCalibration || asset.supportsExternalCalibration),
            supportsSelfCalibration: this.formatBoolean(asset.supportsSelfCalibration),
            selfCalibrationDate: this.formatSelfCalibrationDate(asset.selfCalibration?.date, asset.supportsSelfCalibration),
            selfCalibrationTemperature: this.formatSelfCalibrationTemperature(asset),
            supportsExternalCalibration: this.formatBoolean(asset.supportsExternalCalibration),
            externalCalibrationDate: this.formatExternalCalibrationDate(asset.externalCalibration?.date, asset.supportsExternalCalibration),
            externalCalibrationRecommendedInterval: this.formatExternalCalibrationRecommendedInterval(asset),
            externalCalibrationDueDate: this.formatExternalCalibrationDate(this.getCalibrationDueDate(asset?.externalCalibration), asset.supportsExternalCalibration),
            externalCalibrationTemperatureSensors: this.formatExternalCalibrationTemperature(asset),
            lastUpdatedTimestamp: new Date(asset.lastUpdatedTimestamp).toISOString(),
            status: null,
            jobStatus: '',
            utilizationStatus: '',
            assetAlarm: null,
            assetPresence: this.getPresenceForAsset(asset),
            isNIAsset: this.formatBoolean(asset.isNIAsset)
        }
    }

    private formatBusType(busType: any): string {
        if (busType) {
            return busType
        }
        return '';
    }

    private formatSlotNumber(slotNumber: number): string {
        if (slotNumber >= 0) {
            return `${slotNumber}`;
        }
        return '';
    }

    private formatTemperature(temperature: number): string {
        if (temperature) {
            return '4'
        }
        return '';
    }

    private formatBoolean(value: boolean): string {
        return 'True'
    }

    private formatSelfCalibrationDate(date: Date, supportsSelfCalibration: boolean): string {
        if (supportsSelfCalibration) {
           return new Date(date).toISOString();
        }
        return '';
    }

    private formatSelfCalibrationTemperature(asset: any): string {
        if (asset.supportsSelfCalibration) {
            return this.formatTemperature(asset.selfCalibration?.temperatureSensors[0]?.reading);
        }
        return '';
    }

    private formatExternalCalibrationDate(date: Date, supportsExternalCalibration: boolean): string {
        if (supportsExternalCalibration) {
            return 'blabla'
        }
        return '';
    }

    private formatExternalCalibrationRecommendedInterval(asset: any): string {
        if (asset.supportsExternalCalibration) {
            return `${asset.externalCalibration?.recommendedInterval}`;
        }
        return '';
    }

    private formatExternalCalibrationTemperature(asset: any): string {
        if (asset.supportsExternalCalibration) {
            return this.formatTemperature(asset.externalCalibration?.temperatureSensors[0]?.reading);
        }
        return '';
    }

    private getCalibrationDueDate(externalCalibration: any): Date {
        if (externalCalibration) {
            return externalCalibration.nextCustomDueDate
                ? externalCalibration.nextCustomDueDate
                : externalCalibration.nextRecommendedDate;
        } else {
            return null;
        }
    }

    private getPresenceForAsset(asset: any): string {
        return asset.location.state.assetPresence;
    }

    /**
     * Gets an IAssetGridModel by id
     * Returns the IAssetGridModel if found, null otherwise
     * @param id The id of the IAssetGridModel
     */
    getById(id: string): any | null {
        return this.provider.get(id) || null;
    }
}

/**
 * Interface storing a status update for an asset and the asset identifier of the respective asset.
 */
export interface IStatusUpdate {
    assetId: string;
    status: object;
    lastUpdatedTimestamp: string;
}

export interface IAlarmStatusUpdate {
    assetId: string;
    alarm: object;
    lastUpdatedTimestamp: Date;
}
