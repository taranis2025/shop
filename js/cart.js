// ===== CARRITO DE COMPRAS =====
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    // Cargar carrito del localStorage
    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Agregar producto al carrito
    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} agregado al carrito!`);
    }

    // Actualizar cantidad
    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(id);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    // Eliminar producto
    removeFromCart(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Producto eliminado');
    }

    // Calcular total
    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Actualizar contador del carrito
    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.querySelector('.cart-count');
        
        if (cartCountEl) {
            cartCountEl.textContent = count;
            if (count > 0) {
                cartCountEl.style.display = 'block';
            } else {
                cartCountEl.style.display = 'none';
            }
        }
    }

    // Renderizar carrito
    renderCart() {
        const cartItemsEl = document.querySelector('.cart-items');
        const cartTotalEl = document.querySelector('.cart-total');
        const emptyCartEl = document.querySelector('.empty-cart');
        
        if (!cartItemsEl) return;

        if (this.items.length === 0) {
            cartItemsEl.innerHTML = `
                <div class="empty-cart">
                    <p>🛒 Tu carrito está vacío</p>
                    <p>Agrega productos para verlos aquí</p>
                </div>
            `;
            if (cartTotalEl) cartTotalEl.style.display = 'none';
            if (emptyCartEl) emptyCartEl.style.display = 'block';
            return;
        }

        if (emptyCartEl) emptyCartEl.style.display = 'none';
        if (cartTotalEl) cartTotalEl.style.display = 'block';

        cartItemsEl.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}" style="
                    background: none;
                    border: none;
                    color: var(--danger-color);
                    cursor: pointer;
                    font-size: 1.5rem;
                    font-weight: bold;
                ">&times;</button>
            </div>
        `).join('');

        // Event listeners para botones
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity - 1);
            });
        });

        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity + 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.removeFromCart(id);
            });
        });

        // Actualizar total
        if (cartTotalEl) {
            cartTotalEl.textContent = `Total: $${this.calculateTotal().toFixed(2)}`;
        }
    }

    // Mostrar notificación
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Limpiar carrito
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }
}

// Animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar carrito
const cart = new ShoppingCart();

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.dataset.id,
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', ''))
            };
            cart.addToCart(product);
            cart.renderCart();
        });
    });

    // Abrir/Cerrar carrito
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const overlay = document.querySelector('.cart-overlay');

    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
            cart.renderCart();
        });
    }

    if (closeCart && cartModal) {
        closeCart.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });
    }

    // Cerrar carrito al hacer clic fuera
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('active');
            }
        });
    }

    // Botón de checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length === 0) {
                alert('Tu carrito está vacío. Agrega productos primero.');
                return;
            }
            
            let orderDetails = '¡Hola! Quisiera hacer el siguiente pedido:\n\n';
            cart.items.forEach(item => {
                orderDetails += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
            });
            orderDetails += `\nTotal: $${cart.calculateTotal().toFixed(2)}`;
            
            // Enviar por WhatsApp o mostrar mensaje
            alert('¡Pedido realizado exitosamente!\n\n' + orderDetails);
            cart.clearCart();
        });
    }
});
