export default class CreateAccount extends React.Component {
	signup() {
		const username = document.getElementById('username-set').value;
		const password = document.getElementById('password-set').value;

		fetch('http://127.0.0.1:5000/api/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username, password: password }),
		})
			.then((response) => {
				if (response.status == 200) {
					response.json().then((data) => {
						console.log(data);
						this.props.loginHandler();
						window.localStorage.setItem(
							'session_token',
							data.api_key
						);
					});
				} else {
					console.log(response.status);
					console.log('failed login', this.props);
				}
			})
			.catch((response) => {
				console.log(response);
			});
	}

	render() {
		window.history.pushState('', '', '/create-account');
		return (
			<div>
				<div className='clip'>
					<div className='auth container'>
						<h2>Create Account</h2>
						<div className='alignedForm'>
							<label htmlFor='username'>Username: </label>
							<input name='username' id='username-set'></input>
							<div id='username-update'></div>
							<label htmlFor='password'>Password: </label>
							<input
								type='password'
								name='password'
								id='password-set'
							></input>
							<div id='username-update'></div>
							<label htmlFor='repeatPassword'>Repeat: </label>
							<input
								type='password'
								name='repeatPassword'
							></input>
							{/* <error>Passwords don't match</error> */}
							<div></div>
							<button
								className='createAccount'
								onClick={() => this.signup()}
							>
								Create Account
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

