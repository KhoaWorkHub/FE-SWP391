import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProductService} from "../../service/product.service";
import {ToastrService} from "ngx-toastr";
import {NumberService} from "../../service/number.service";
import {AccountService} from "../../auth/services/account.service";
import {CartService} from "../../service/cart.service";
import {Subscription} from "rxjs";
import {OrderService} from "../../service/order.service";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit{
  isSelectAll:boolean = false;
  lisProductsCart : any[];
  subscription: Subscription;
  subscription2: Subscription;
  subscription1: Subscription;
  totalProduct: any;
  totalPriceProduct: any;
  isLoginUser:boolean = false;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private productService: ProductService,
              private toastrService: ToastrService,
              private numberFormat: NumberService,
              private accountServie: AccountService,
              private cartService: CartService,
              private orderService: OrderService) {
  }
  ngOnInit(): void {
    this.isLoginUser = localStorage.getItem("user") != null;
    this.getProductCart();
  }
  getProductCart() {
    const request = {
      customer_id : 1
    }
    this.cartService.getProductInCart(request).subscribe((res) =>{
      // this.lisProductsCart = res?.data;
      this.cartService.cartItems.next(res?.data);
      this.cartService.totalProductInCart.next(this.cartService.getTotalProduct(res?.data));
      this.cartService.totalPrice.next(this.cartService.getTotalPriceV2(res?.data));
      this.subscription = this.cartService.totalProductInCart$.subscribe(data=>this.totalProduct = data);
      this.subscription2 = this.cartService.totalPrice$.subscribe(data => this.totalPriceProduct = data);
      this.subscription1 = this.cartService.cartItems$.subscribe(data => this.lisProductsCart = data.map(value => {
        value.isChecked = false;
        return value;
      }));
      console.log(this.lisProductsCart);
    }, error => {

    })
  }
  clickSelectAll() {
    const listCopy = this.lisProductsCart.map( value => {
      if(!this.isSelectAll){
        value.isChecked = true;
      } else {
        value.isChecked = false;
      }
      return value;
    });
    this.lisProductsCart = [...listCopy];
    console.log(this.lisProductsCart);
  }
  addProductCart(product:any, quantity:number){
    if(!this.isLoginUser) {
      this.toastrService.error("Bạn phải đăng nhập trước");
      return;
    }
    const request = {
      jewelry_id : product?.id_jewelry,
      quantity : quantity
    }
    this.cartService.updateProductToCard(request).subscribe((res) =>{
      this.getProductCart();
    }, error => {
      this.toastrService.error("Update sản phầm thất bại");
    });
  }
  convertNumber(number){
    return this.numberFormat.convertNumber(number);
  }

  deleteProductCart(product:any) {
    if(!this.isLoginUser) {
      this.toastrService.error("Bạn phải đăng nhập trước");
      return;
    }
    const request = {
      cart_id : product?.id,
    }
    this.cartService.removeCartItem(request).subscribe((res) =>{
      this.toastrService.success("Delete product success");
      this.getProductCart();
    }, error => {
      this.toastrService.error("Update sản phầm thất bại");
    });
  }
  addProductToOrder() {
    const listSelectCart = this.lisProductsCart.filter(item => item.isChecked == true);
    if (listSelectCart.length < 1){
      return this.toastrService.error("No item select in Cart");
    }
    const idsCart = listSelectCart.map(item => {
      return item.id;
    })

    const request = {
      cart_ids : idsCart
    }
    console.log(listSelectCart);
    console.log(idsCart);
    this.orderService.addOrder(request).subscribe((res) =>{
      this.toastrService.success("Create Order success");
      const returnUrl = this.route.snapshot.queryParams['/order-list'] || '/order-list';
      this.router.navigateByUrl(returnUrl).then(r =>{});
    }, error => {
      this.toastrService.error("Create order fail !!!");
    })

  }

}