var FreeHxxd = new Object;

FreeHxxd.user = new Array;
FreeHxxd.last = null;
FreeHxxd.current = null;

window.addEventListener('load', function() {
	var menu = document.getElementById("menu");
	var input_user = document.getElementById("input-user");
	var import_user = document.getElementById("import-user");
	var export_user = document.getElementById("export-user");
	var import_last = document.getElementById("import-last");
	var input_current = document.getElementById("input-current");
	var import_current = document.getElementById("import-current");
	var export_current = document.getElementById("export-current");

	function MenuConfig(item, enabled, click_callback) {
		item.click_callback = click_callback;
		item.setEnable = function(enabled) {
			this.enabled = enabled;
			this.setAttribute("enabled", this.enabled);
			this.onclick = this.enabled ? this.click_callback : null;
		}

		item.setEnable(enabled);
	}

	function EnableReceipt() {
		import_user.setEnable(true);
		export_user.setEnable(true);
		import_last.setEnable(true);
		input_current.setEnable(true);
		import_current.setEnable(true);
		export_current.setEnable(true);
	}

	var workspace_input_user = document.getElementById("workspace-input-user");
	var workspace_input_using = document.getElementById("workspace-input-using");
	var workspace_output = document.getElementById("workspace-output");
	var workspace_list = new Array(
		workspace_input_user,
		workspace_input_using,
		workspace_output,
	);

	function ToggleWorkspace(open_workspace) {
		workspace_list.forEach(function(workspace) {
			workspace.style.display = open_workspace != workspace ? "none" : "unset";
		});
	}

	var _template_input_user = document.querySelector("[template=input-user]");
	var _template_input_using = document.querySelector("[template=input-using]");
	var _template_receipt_result = document.querySelector("[template=receipt-result]");

	_template_input_user.removeAttribute("template");
	_template_input_using.removeAttribute("template");
	_template_receipt_result.removeAttribute("template");

	var template_input_user = _template_input_user.parentNode.innerHTML;
	var template_input_using = _template_input_using.parentNode.innerHTML;
	var template_receipt_result = _template_receipt_result.parentNode.innerHTML;
	var template_receipt_result_format = _template_receipt_result.querySelector("[vid=receipt-total-text]").getAttribute("format");
	var template_receipt_result_unit = _template_receipt_result.querySelector("[vid=receipt-total-text]").getAttribute("unit");

	_template_input_user.parentNode.removeChild(_template_input_user);
	_template_input_using.parentNode.removeChild(_template_input_using);
	_template_receipt_result.parentNode.removeChild(_template_receipt_result);

	var input_user_box = document.getElementById("input-user-box");
	document.getElementById("data-input-add-btn").onclick = function() {
		input_user_box.insertAdjacentHTML('beforeend', template_input_user);
		FreeHxxd.last = null;
		FreeHxxd.current = null;
	}

	document.getElementById("data-input-exit-btn").onclick = function() {
		var input_list = input_user_box.querySelectorAll('.data-input');
		var have_user = false;
		input_list.forEach(function(input) {
			var resident_name = input.querySelector("[vid=input-user-resident-name]").value.trim();

			if (resident_name.length != 0) {
				have_user = true;
				FreeHxxd.user.push({
					resident_name: resident_name,
					water_unit_price: input.querySelector("[vid=input-user-water-unit-price]").value,
					water_loss_rate: input.querySelector("[vid=input-user-water-loss-rate]").value,
					electricity_unit_price: input.querySelector("[vid=input-user-electricity-unit-price]").value,
					electricity_loss_rate: input.querySelector("[vid=input-user-electricity-loss-rate]").value,
					public_electricity: input.querySelector("[vid=input-user-public-electricity]").value,
					sanitation_fee: input.querySelector("[vid=input-user-sanitation-fee]").value,
					management_fee: input.querySelector("[vid=input-user-management-fee]").value,
					other_fees: input.querySelector("[vid=input-user-other-fees]").value,
					rent: input.querySelector("[vid=input-user-rent]").value,
				});
			}
		});
		if (have_user) {
			EnableReceipt();
			input_current.click(null, true);
		} else {
			ToggleWorkspace(null);
		}
	}

	document.getElementById("data-input-receipt-btn").onclick = function() {
		var vdom = document.createElement("div"), receipt_item;
		var table_item_list = input_using_box.querySelectorAll(".table-item");
		const currentTime = new Date();
		const year = currentTime.getFullYear();
		const month = currentTime.getMonth() + 1;
		const day = currentTime.getDate();

		workspace_output.innerHTML = "";
		ToggleWorkspace(workspace_output);

		table_item_list.forEach(function(table_item) {
			var water_last = parseFloat(table_item.querySelector("[vid=input-using-water-last]").value);
			var water_current = parseFloat(table_item.querySelector("[vid=input-using-water-current]").value);
			var water_used = water_current - water_last;
			var water_unit_price = parseFloat(table_item.querySelector("[vid=input-using-water-unit-price]").value);
			var water_loss = parseFloat((parseFloat(table_item.querySelector("[vid=input-using-water-loss-rate]").value) * water_used).toFixed(2));
			var water_total = parseFloat(((water_used + water_loss) * water_unit_price).toFixed(2));

			var electricity_last = parseFloat(table_item.querySelector("[vid=input-using-electricity-last]").value);
			var electricity_current = parseFloat(table_item.querySelector("[vid=input-using-electricity-current]").value);
			var electricity_used = electricity_current - electricity_last;
			var electricity_public = parseFloat(table_item.querySelector("[vid=input-using-public-electricity]").value);
			var electricity_unit_price = parseFloat(table_item.querySelector("[vid=input-using-electricity-unit-price]").value);
			var electricity_loss = parseFloat((parseFloat(table_item.querySelector("[vid=input-using-electricity-loss-rate]").value) * electricity_used).toFixed(2));
			var electricity_total = parseFloat(((electricity_used + electricity_loss + electricity_public) * electricity_unit_price).toFixed(2));

			var sanitation_fee = parseFloat(table_item.querySelector("[vid=input-using-sanitation-fee]").value);
			var management_fee = parseFloat(table_item.querySelector("[vid=input-using-management-fee]").value);
			var other_fees = parseFloat(table_item.querySelector("[vid=input-using-other-fees]").value);
			var rent = parseFloat(table_item.querySelector("[vid=input-using-rent]").value);

			var total = (water_total + electricity_total + sanitation_fee + management_fee + other_fees + rent).toFixed(1);
			var total_fill = total.toString().padStart(7, '0');
			var total_fixup = "";
			var total_str = new Array(total_fill.length);

			for (var i = total_fill.length - 1; i >= 0; --i) {
				if (total_fill[i] != ".") {
					total_str[i] = template_receipt_result_format[parseInt(total_fill[i])];
				}
			}

			for (var i = 0; i < total_fill.length; ++i) {
				if (total_fill[i] != "0") {
					if (i == 0) {
						total_fixup = template_receipt_result_unit + " ";
					} else {
						total_str[i - 1] = template_receipt_result_unit;
					}
					break;
				}

				total_str[i] = " ";
			}

			vdom.innerHTML = template_receipt_result;
			receipt_item = vdom.querySelector(".receipt-item");
			receipt_item.querySelector("[vid=receipt-user-name]").textContent = table_item.querySelector("[vid=input-using-resident-name]").textContent;
			receipt_item.querySelector("[vid=receipt-date-year]").textContent = year;
			receipt_item.querySelector("[vid=receipt-date-month]").textContent = month;
			receipt_item.querySelector("[vid=receipt-date-day]").textContent = day;
			receipt_item.querySelector("[vid=receipt-water-last]").textContent = water_last;
			receipt_item.querySelector("[vid=receipt-water-current]").textContent = water_current;
			receipt_item.querySelector("[vid=receipt-water-used]").textContent = water_used;
			receipt_item.querySelector("[vid=receipt-water-unit-price]").textContent = water_unit_price;
			receipt_item.querySelector("[vid=receipt-water-total]").textContent = water_total;
			receipt_item.querySelector("[vid=receipt-water-loss]").textContent = water_loss;
			receipt_item.querySelector("[vid=receipt-electricity-last]").textContent = electricity_last;
			receipt_item.querySelector("[vid=receipt-electricity-current]").textContent = electricity_current;
			receipt_item.querySelector("[vid=receipt-electricity-used]").textContent = electricity_used;
			receipt_item.querySelector("[vid=receipt-electricity-unit-price]").textContent = electricity_unit_price;
			receipt_item.querySelector("[vid=receipt-electricity-total]").textContent = electricity_total;
			receipt_item.querySelector("[vid=receipt-electricity-loss]").textContent = electricity_loss;
			receipt_item.querySelector("[vid=receipt-sanitation-fee]").textContent = sanitation_fee;
			if (electricity_public != 0) {
				receipt_item.querySelector("[vid=receipt-public-electricity]").textContent = electricity_public;
			} else {
				receipt_item.querySelector("[vid=receipt-public-electricity-text]").style.display = "none";
			}
			receipt_item.querySelector("[vid=receipt-management-fee]").textContent = management_fee;
			receipt_item.querySelector("[vid=receipt-other-fees]").textContent = other_fees;
			receipt_item.querySelector("[vid=receipt-rent]").textContent = rent;
			receipt_item.querySelector("[vid=receipt-total-10000]").textContent = total_fixup + total_str[0];
			receipt_item.querySelector("[vid=receipt-total-1000]").textContent = total_str[1];
			receipt_item.querySelector("[vid=receipt-total-100]").textContent = total_str[2];
			receipt_item.querySelector("[vid=receipt-total-10]").textContent = total_str[3];
			receipt_item.querySelector("[vid=receipt-total-1]").textContent = total_str[4];
			receipt_item.querySelector("[vid='receipt-total-0.1']").textContent = total_str[6];
			receipt_item.querySelector("[vid=receipt-total]").textContent = total;
			workspace_output.appendChild(receipt_item);
		});
		delete vdom;
	}

	MenuConfig(input_user, true, function() {
		ToggleWorkspace(workspace_input_user);
	});

	MenuConfig(import_user, true, function() {
		var input = document.createElement('input');
		input.setAttribute('type','file');
		input.setAttribute('accept', ".json");
		input.click();
		input.onchange = function() {
			var result_file = this.files[0];

			if (!result_file) {
				return;
			}
			var reader = new FileReader();
			reader.readAsText(result_file,'UTF-8');
			reader.onload = function (e) {
				var have_user = false, vdom = document.createElement("div"), data_input;

				delete FreeHxxd.user;
				FreeHxxd.user = JSON.parse(this.result);
				FreeHxxd.last = null;
				FreeHxxd.current = null;
				input_user_box.innerHTML = "";

				FreeHxxd.user.forEach(function(input) {
					have_user = true;
					vdom.innerHTML = template_input_user;
					data_input = vdom.querySelector(".data-input");
					data_input.querySelector("[vid=input-user-resident-name]").value = input.resident_name;
					data_input.querySelector("[vid=input-user-water-unit-price]").value = input.water_unit_price;
					data_input.querySelector("[vid=input-user-water-loss-rate]").value = input.water_loss_rate;
					data_input.querySelector("[vid=input-user-electricity-unit-price]").value = input.electricity_unit_price;
					data_input.querySelector("[vid=input-user-electricity-loss-rate]").value = input.electricity_loss_rate;
					data_input.querySelector("[vid=input-user-public-electricity]").value = input.public_electricity;
					data_input.querySelector("[vid=input-user-sanitation-fee]").value = input.sanitation_fee;
					data_input.querySelector("[vid=input-user-management-fee]").value = input.management_fee;
					data_input.querySelector("[vid=input-user-other-fees]").value = input.other_fees;
					data_input.querySelector("[vid=input-user-rent]").value = input.rent;
					input_user_box.appendChild(data_input);
				});
				delete vdom;

				if (have_user) {
					EnableReceipt();
					input_current.click(null, true);
				} else {
					ToggleWorkspace(null);
				}
			};
		}
	});

	MenuConfig(export_user, false, function() {
		if (FreeHxxd.user.length != 0) {
			var a = document.createElement('a');

			a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(FreeHxxd.user)));
			a.setAttribute('download', `user-${FreeHxxd.user.length}.json`);
			a.click();
		}
	});

	MenuConfig(import_last, false, function() {
		var input = document.createElement('input');
		input.setAttribute('type','file');
		input.setAttribute('accept', ".json");
		input.click();
		input.onchange = function() {
			var result_file = this.files[0];

			if (!result_file) {
				return;
			}
			var reader = new FileReader();
			reader.readAsText(result_file,'UTF-8');
			reader.onload = function (e) {
				var table_item_list = input_using_box.querySelectorAll(".table-item");

				FreeHxxd.last = JSON.parse(this.result);

				table_item_list.forEach(function(table_item) {
					var name = table_item.querySelector("[vid=input-using-resident-name]").textContent;

					table_item.querySelector("[vid=input-using-water-last]").value = FreeHxxd.last[name] ? FreeHxxd.last[name]["water"] : 0;
					table_item.querySelector("[vid=input-using-electricity-last]").value = FreeHxxd.last[name] ? FreeHxxd.last[name]["electricity"] : 0;
				});
			};
		}
	});

	var input_using_box = document.getElementById("input-using-box");
	MenuConfig(input_current, false, function(event, change) {
		if (!change && input_using_box.querySelector(".table-item") != null) {
			ToggleWorkspace(workspace_input_using);
			return;
		}
		var vdom = document.createElement("div");

		input_using_box.innerHTML = "";
		ToggleWorkspace(workspace_input_using);

		FreeHxxd.user.forEach(function(input) {
			var name = input.resident_name;
			vdom.innerHTML = template_input_using;
			table_item = vdom.querySelector(".table-item");
			table_item.querySelector("[vid=input-using-resident-name]").textContent = input.resident_name;
			table_item.querySelector("[vid=input-using-water-last]").value = FreeHxxd.last && FreeHxxd.last[name] ? FreeHxxd.last[name].water : 0;
			table_item.querySelector("[vid=input-using-electricity-last]").value = FreeHxxd.last && FreeHxxd.last[name] ? FreeHxxd.last[name].electricity : 0;
			table_item.querySelector("[vid=input-using-water-current]").value = FreeHxxd.current && FreeHxxd.current[name] ? FreeHxxd.current[name].water : 0;
			table_item.querySelector("[vid=input-using-electricity-current]").value = FreeHxxd.current && FreeHxxd.current[name] ? FreeHxxd.current[name].electricity : 0;
			table_item.querySelector("[vid=input-using-water-unit-price]").value = input.water_unit_price;
			table_item.querySelector("[vid=input-using-water-loss-rate]").value = input.water_loss_rate;
			table_item.querySelector("[vid=input-using-electricity-unit-price]").value = input.electricity_unit_price;
			table_item.querySelector("[vid=input-using-electricity-loss-rate]").value = input.electricity_loss_rate;
			table_item.querySelector("[vid=input-using-public-electricity]").value = input.public_electricity;
			table_item.querySelector("[vid=input-using-sanitation-fee]").value = input.sanitation_fee;
			table_item.querySelector("[vid=input-using-management-fee]").value = input.management_fee;
			table_item.querySelector("[vid=input-using-other-fees]").value = input.other_fees;
			table_item.querySelector("[vid=input-using-rent]").value = input.rent;
			input_using_box.appendChild(table_item);
		});
		delete vdom;
	});

	MenuConfig(import_current, false, function() {
		var input = document.createElement('input');
		input.setAttribute('type','file');
		input.setAttribute('accept', ".json");
		input.click();
		input.onchange = function() {
			var result_file = this.files[0];

			if (!result_file) {
				return;
			}
			var reader = new FileReader();
			reader.readAsText(result_file,'UTF-8');
			reader.onload = function (e) {
				var table_item_list = input_using_box.querySelectorAll(".table-item");

				FreeHxxd.current = JSON.parse(this.result);

				table_item_list.forEach(function(table_item) {
					var name = table_item.querySelector("[vid=input-using-resident-name]").textContent;

					table_item.querySelector("[vid=input-using-water-current]").value = FreeHxxd.current[name]["water"];
					table_item.querySelector("[vid=input-using-electricity-current]").value = FreeHxxd.current[name]["electricity"];
				});
			};
		}
	});

	MenuConfig(export_current, false, function() {
		var table_item_list = input_using_box.querySelectorAll(".table-item");

		FreeHxxd.current = new Object;

		table_item_list.forEach(function(table_item) {
			var name = table_item.querySelector("[vid=input-using-resident-name]").textContent;

			FreeHxxd.current[name] = new Object;
			FreeHxxd.current[name]["water"] = table_item.querySelector("[vid=input-using-water-current]").value;
			FreeHxxd.current[name]["electricity"] = table_item.querySelector("[vid=input-using-electricity-current]").value;
		});

		var a = document.createElement('a');
		const currentTime = new Date();
		const year = currentTime.getFullYear();
		const month = currentTime.getMonth() + 1;
		const day = currentTime.getDate();

		a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(FreeHxxd.current)));
		a.setAttribute('download', `data-${year}-${month}-${day}.json`);
		a.click();
	});

	document.addEventListener('mousedown', function(event) {
		if (event.which == 3) {
			event.stopPropagation();
			menu.style.left = event.clientX + "px";
			menu.style.top = event.clientY + "px";
			menu.setAttribute("enabled", true);
			if (event.clientX + menu.clientWidth > document.documentElement.clientWidth) {
				menu.style.left = (document.documentElement.clientWidth - menu.clientWidth) + "px";
			}
			if (event.clientY + menu.clientHeight > document.documentElement.clientHeight) {
				menu.style.top = (document.documentElement.clientHeight - menu.clientHeight) + "px";
			}
		} else if (event.target == menu || event.target.parentNode == menu || event.target.parentNode.parentNode == menu) {
			menu.click = true;
			return;
		} else {
			menu.setAttribute("enabled", false);
		}
	}, true);

	document.getElementById("tip").onmouseup = function() {
		document.addEventListener('mouseup', function(event) {
			if (menu.click) {
				menu.click = false;
				menu.setAttribute("enabled", false);
			}
		}, true);

		this.parentNode.removeChild(this);
	}

	document.addEventListener('contextmenu', function(event) {
		event.returnValue = false;
		event.preventDefault();
	}, true);
})

window.addEventListener('beforeunload', function(event) {
	event.returnValue = "Receipt " + new Date().getFullYear().toString();
}, true);