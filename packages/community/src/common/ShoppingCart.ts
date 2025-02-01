import EquipmentService, {
  RentEquipmentRequest,
} from 'services/EquipmentService';

class ShoppingCart {
  private items: number[] = [];

  init() {
    this.items = this.getFromLocalStorage();
  }

  private getFromLocalStorage(): number[] {
    const cart: string = localStorage.getItem('cart')?.toString() || '';
    return cart.split(',').map((id) => parseInt(id, 10));
  }

  private saveToLocalStorage() {
    localStorage.setItem('cart', this.items.join(','));
  }

  public addItem(itemId: number): boolean {
    if (this.items.includes(itemId)) {
      return false;
    }
    this.items.push(itemId);
    this.saveToLocalStorage();
    return true;
  }

  public removeItem(itemId: number): boolean {
    const index = this.items.indexOf(itemId);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getItems(): number[] {
    return this.items;
  }

  public clear() {
    this.items = [];
    this.saveToLocalStorage();
  }

  public count(): number {
    return this.items.length;
  }

  public submit(onSuccess: () => void, onFailure: (numbers: number[]) => void) {
    const datarequest: RentEquipmentRequest = {
      equipmentIds: this.items,
    };
    EquipmentService.rentEquipment(datarequest)
      .then((res) => {
        const successIds: number[] = res.data.successIds;
        const failureIds: number[] = res.data.failureIds;

        if (failureIds.length > 0) {
          this.items.filter((id) => !successIds.includes(id));
          onFailure(failureIds);
          return;
        } else {
          this.clear();
          onSuccess();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

export default ShoppingCart;
